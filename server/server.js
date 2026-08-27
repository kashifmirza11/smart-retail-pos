const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { sql, connectDatabase } = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./authMiddleware");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Smart POS backend is running",
  });
});app.get("/api/products", authenticateToken, async (req, res) => {
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
app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    console.log("Received product:", req.body);
    const name = req.body.name ?? req.body.Name;
    const category = req.body.category ?? req.body.Category;
    const price = req.body.price ?? req.body.Price;
    const stock = req.body.stock ?? req.body.Stock;

    const missingFields = [];

    if (!name) missingFields.push("name");
    if (!category) missingFields.push("category");
    if (price === undefined) missingFields.push("price");
    if (stock === undefined) missingFields.push("stock");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing fields: ${missingFields.join(", ")}`,
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
app.put("/api/products/:id", authenticateToken, async (req, res) => {
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
const previousRequest = new sql.Request();
previousRequest.input("id", sql.Int, productId);

const previousResult = await previousRequest.query(`
  SELECT Stock
  FROM Products
  WHERE Id = @id
`);

if (previousResult.recordset.length === 0) {
  return res.status(404).json({
    message: "Product not found.",
  });
}

const previousStock = Number(previousResult.recordset[0].Stock);
const newStock = Number(stock);
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
   console.log("STOCK CHECK:", {
     productId,
     previousStock,
     newStock,
   });
    }
if (previousStock !== newStock) {
  const historyRequest = new sql.Request();

  historyRequest.input("productId", sql.Int, productId);
 historyRequest.input("movementType", sql.VarChar(50), newStock > previousStock ? "Restock" : "Sale Out");
 historyRequest.input("quantityChange", sql.Int, newStock - previousStock);
  historyRequest.input("previousStock", sql.Int, previousStock);
  historyRequest.input("newStock", sql.Int, newStock);

  await historyRequest.query(`
   INSERT INTO StockHistory
  (
    ProductId,
    MovementType,
    QuantityChange,
    PreviousStock,
    NewStock,
    MovementDate
  )
VALUES
  (
    @productId,
    @movementType,
    @quantityChange,
    @previousStock,
    @newStock,
    GETDATE()
  )
  `);
}
    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: "Unable to update product: " + error.message,
      error: error.message,
    });
  }
});
app.delete("/api/products/:id", authenticateToken, async (req, res) => {
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
app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    const request = new sql.Request();

    const result = await request.query(`
      SELECT Id, Name, Role, Phone, Status, CreatedAt
      FROM Employees
      ORDER BY Id DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load employees.",
      error: error.message,
    });
  }
});
app.post("/api/employees", authenticateToken, async (req, res) => {
  try {
    const { name, role, phone, status } = req.body;

    if (!name || !role || !phone) {
      return res.status(400).json({
        message: "Name, role and phone are required.",
      });
    }

    const request = new sql.Request();

    request.input("Name", sql.NVarChar, name.trim());
    request.input("Role", sql.NVarChar, role);
    request.input("Phone", sql.NVarChar, phone.trim());
    request.input("Status", sql.NVarChar, status || "Active");

    const result = await request.query(`
      INSERT INTO Employees (Name, Role, Phone, Status)
      OUTPUT INSERTED.*
      VALUES (@Name, @Role, @Phone, @Status)
    `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: "Unable to add employee.",
      error: error.message,
    });
  }
});
app.put("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    const { name, role, phone, status } = req.body;

    if (!name || !role || !phone) {
      return res.status(400).json({
        message: "Name, role and phone are required.",
      });
    }

    const request = new sql.Request();

    request.input("Id", sql.Int, req.params.id);
    request.input("Name", sql.NVarChar, name.trim());
    request.input("Role", sql.NVarChar, role);
    request.input("Phone", sql.NVarChar, phone.trim());
    request.input("Status", sql.NVarChar, status || "Active");

    const result = await request.query(`
      UPDATE Employees
      SET Name = @Name,
          Role = @Role,
          Phone = @Phone,
          Status = @Status
      OUTPUT INSERTED.*
      WHERE Id = @Id
    `);

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: "Unable to update employee.",
      error: error.message,
    });
  }
});
app.delete("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    const request = new sql.Request();
    request.input("Id", sql.Int, req.params.id);

    const result = await request.query(`
      DELETE FROM Employees
      OUTPUT DELETED.Id
      WHERE Id = @Id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    res.json({
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete employee.",
      error: error.message,
    });
  }
});
app.get("/api/stock-history", authenticateToken, async (req, res) => {
  try {
    const request = new sql.Request();

    const result = await request.query(`
      SELECT
        sh.Id,
        sh.ProductId,
        p.Name AS ProductName,
        sh.MovementType,
        sh.QuantityChange,
        sh.PreviousStock,
        sh.NewStock,
        sh.MovementDate
      FROM StockHistory sh
      INNER JOIN Products p ON p.Id = sh.ProductId
      ORDER BY sh.MovementDate DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load stock history.",
      error: error.message,
    });
  }
});
app.delete("/api/stock-history", authenticateToken, async (req, res) => {
  try {
    const request = new sql.Request();
    await request.query("DELETE FROM StockHistory");

    res.json({
      message: "Stock history cleared successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to clear stock history.",
      error: error.message,
    });
  }
});
app.post("/api/sales", authenticateToken, async (req, res) => {
  let transaction;

  try {
    const { customer, productId, quantity, paymentMethod } = req.body;

    if (
      !customer ||
      !Number.isInteger(Number(productId)) ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1 ||
      !["Cash", "Card", "Bank Transfer"].includes(paymentMethod)
    ) {
      return res.status(400).json({
        message: "Valid sale details are required.",
      });
    }

    transaction = new sql.Transaction();
    await transaction.begin();

    const productRequest = new sql.Request(transaction);
    productRequest.input("productId", sql.Int, Number(productId));

    const productResult = await productRequest.query(`
      SELECT Id, Name, Price, Stock
      FROM Products
      WHERE Id = @productId AND IsActive = 1
    `);

    if (productResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const product = productResult.recordset[0];
    const saleQuantity = Number(quantity);
    const previousStock = Number(product.Stock);

    if (saleQuantity > previousStock) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Only ${previousStock} items are available.`,
      });
    }

    const unitPrice = Number(product.Price);
    const total = unitPrice * saleQuantity;
    const newStock = previousStock - saleQuantity;

    const saleRequest = new sql.Request(transaction);
    saleRequest.input("customer", sql.VarChar(150), customer.trim());
    saleRequest.input("productId", sql.Int, Number(productId));
    saleRequest.input("quantity", sql.Int, saleQuantity);
    saleRequest.input("paymentMethod", sql.VarChar(50), paymentMethod);
    saleRequest.input("unitPrice", sql.Decimal(10, 2), unitPrice);
    saleRequest.input("total", sql.Decimal(10, 2), total);
    saleRequest.input("status", sql.VarChar(50), "Completed");

    const saleResult = await saleRequest.query(`
      INSERT INTO Sales
        (
          Customer,
          ProductId,
          Quantity,
          PaymentMethod,
          UnitPrice,
          Total,
          Status,
          SaleDate
        )
      OUTPUT INSERTED.*
      VALUES
        (
          @customer,
          @productId,
          @quantity,
          @paymentMethod,
          @unitPrice,
          @total,
          @status,
          GETDATE()
        )
    `);

    const stockRequest = new sql.Request(transaction);
    stockRequest.input("productId", sql.Int, Number(productId));
    stockRequest.input("newStock", sql.Int, newStock);

    await stockRequest.query(`
      UPDATE Products
      SET Stock = @newStock
      WHERE Id = @productId
    `);

    const historyRequest = new sql.Request(transaction);
    historyRequest.input("productId", sql.Int, Number(productId));
    historyRequest.input("quantityChange", sql.Int, -saleQuantity);
    historyRequest.input("previousStock", sql.Int, previousStock);
    historyRequest.input("newStock", sql.Int, newStock);

    await historyRequest.query(`
      INSERT INTO StockHistory
        (
          ProductId,
          MovementType,
          QuantityChange,
          PreviousStock,
          NewStock,
          MovementDate
        )
      VALUES
        (
          @productId,
          'Sale Out',
          @quantityChange,
          @previousStock,
          @newStock,
          GETDATE()
        )
    `);

    await transaction.commit();

    res.status(201).json({
      ...saleResult.recordset[0],
      ProductName: product.Name,
      NewStock: newStock,
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {
        // Transaction was already completed.
      }
    }

    res.status(500).json({
      message: "Unable to complete sale: " + error.message,
    });
  }
});
app.get("/api/sales", authenticateToken, async (req, res) => {
  try {
    const request = new sql.Request();

    const result = await request.query(`
      SELECT
        s.Id,
        s.Customer,
        s.ProductId,
        p.Name AS ProductName,
        s.Quantity,
        s.PaymentMethod,
        s.UnitPrice,
        s.Total,
        s.Status,
        s.SaleDate
      FROM Sales s
      INNER JOIN Products p ON p.Id = s.ProductId
      ORDER BY s.SaleDate DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load sales: " + error.message,
    });
  }
});
app.put("/api/sales/:id/return", authenticateToken, async (req, res) => {
  let transaction;

  try {
    const saleId = Number(req.params.id);

    if (!Number.isInteger(saleId)) {
      return res.status(400).json({
        message: "Valid sale ID is required.",
      });
    }

    transaction = new sql.Transaction();
    await transaction.begin();

    const saleRequest = new sql.Request(transaction);
    saleRequest.input("saleId", sql.Int, saleId);

    const saleResult = await saleRequest.query(`
      SELECT
        s.Id,
        s.ProductId,
        s.Quantity,
        s.Status,
        p.Stock
      FROM Sales s
      INNER JOIN Products p ON p.Id = s.ProductId
      WHERE s.Id = @saleId
    `);

    if (saleResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Sale not found.",
      });
    }

    const sale = saleResult.recordset[0];

    if (sale.Status === "Returned") {
      await transaction.rollback();
      return res.status(400).json({
        message: "This sale has already been returned.",
      });
    }

    const previousStock = Number(sale.Stock);
    const quantity = Number(sale.Quantity);
    const newStock = previousStock + quantity;

    const updateSaleRequest = new sql.Request(transaction);
    updateSaleRequest.input("saleId", sql.Int, saleId);

    await updateSaleRequest.query(`
      UPDATE Sales
      SET Status = 'Returned'
      WHERE Id = @saleId
    `);

    const stockRequest = new sql.Request(transaction);
    stockRequest.input("productId", sql.Int, Number(sale.ProductId));
    stockRequest.input("newStock", sql.Int, newStock);

    await stockRequest.query(`
      UPDATE Products
      SET Stock = @newStock
      WHERE Id = @productId
    `);

    const historyRequest = new sql.Request(transaction);
    historyRequest.input("productId", sql.Int, Number(sale.ProductId));
    historyRequest.input("quantity", sql.Int, quantity);
    historyRequest.input("previousStock", sql.Int, previousStock);
    historyRequest.input("newStock", sql.Int, newStock);

    await historyRequest.query(`
      INSERT INTO StockHistory
        (
          ProductId,
          MovementType,
          QuantityChange,
          PreviousStock,
          NewStock,
          MovementDate
        )
      VALUES
        (
          @productId,
          'Return In',
          @quantity,
          @previousStock,
          @newStock,
          GETDATE()
        )
    `);

    await transaction.commit();

    res.json({
      message: "Sale returned successfully.",
      Status: "Returned",
      NewStock: newStock,
    });
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {
        // Transaction was already completed.
      }
    }

    res.status(500).json({
      message: "Unable to return sale: " + error.message,
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