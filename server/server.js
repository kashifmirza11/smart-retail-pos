const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { sql, connectDatabase } = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart POS backend is running",
  });
});
app.get("/api/products", async (req, res) => {
  try {
    const result = await sql.query(`
      SELECT
        Id,
        Name,
        Category,
        Price,
        Stock,
        IsActive,
        CreatedAt
      FROM Products
WHERE IsActive = 1
ORDER BY Id DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load products.",
      error: error.message,
    });
  }
});
app.post("/api/products", async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Name, category, price and stock are required.",
      });
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        message: "Price and stock cannot be negative.",
      });
    }

    const request = new sql.Request();

    request.input("name", sql.VarChar(150), name.trim());
    request.input("category", sql.VarChar(100), category);
    request.input("price", sql.Decimal(10, 2), Number(price));
    request.input("stock", sql.Int, Number(stock));

    const result = await request.query(`
      INSERT INTO Products (Name, Category, Price, Stock)
      OUTPUT INSERTED.*
      VALUES (@name, @category, @price, @stock)
    `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: "Unable to add product.",
      error: error.message,
    });
  }
});
app.put("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, category, price, stock } = req.body;

    if (
      !Number.isInteger(productId) ||
      !name ||
      !category ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        message: "Valid product data is required.",
      });
    }

    if (Number(price) < 0 || Number(stock) < 0) {
      return res.status(400).json({
        message: "Price and stock cannot be negative.",
      });
    }

    const request = new sql.Request();

    request.input("id", sql.Int, productId);
    request.input("name", sql.VarChar(150), name.trim());
    request.input("category", sql.VarChar(100), category);
    request.input("price", sql.Decimal(10, 2), Number(price));
    request.input("stock", sql.Int, Number(stock));

    const result = await request.query(`
      UPDATE Products
      SET
        Name = @name,
        Category = @category,
        Price = @price,
        Stock = @stock
      OUTPUT INSERTED.*
      WHERE Id = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: "Unable to update product.",
      error: error.message,
    });
  }
});
app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Valid product ID is required.",
      });
    }

    const request = new sql.Request();
    request.input("id", sql.Int, productId);

    const result = await request.query(`
      UPDATE Products
      SET IsActive = 0
      OUTPUT INSERTED.Id
      WHERE Id = @id AND IsActive = 1
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete product.",
      error: error.message,
    });
  }
});
app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        message: "Valid product ID is required.",
      });
    }

    const request = new sql.Request();
    request.input("id", sql.Int, productId);

    const result = await request.query(`
      UPDATE Products
      SET IsActive = 0
      OUTPUT INSERTED.Id
      WHERE Id = @id AND IsActive = 1
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete product.",
      error: error.message,
    });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const request = new sql.Request();
    request.input("email", sql.VarChar(150), email.trim().toLowerCase());

    const result = await request.query(`
      SELECT
        Id,
        Email,
        PasswordHash,
        Role
      FROM Users
      WHERE Email = @email
    `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.PasswordHash);

    if (!passwordIsCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.Id,
        email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.Id,
        email: user.Email,
        role: user.Role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to login.",
      error: error.message,
    });
  }
});
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend could not start.");
    process.exit(1);
  }
};

startServer();