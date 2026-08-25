require("dotenv").config();

const bcrypt = require("bcryptjs");
const { sql, connectDatabase } = require("./db");

const createUserIfMissing = async (email, password, role) => {
  const checkRequest = new sql.Request();
  checkRequest.input("email", sql.VarChar(150), email);

  const existingUser = await checkRequest.query(`
    SELECT Id
    FROM Users
    WHERE Email = @email
  `);

  if (existingUser.recordset.length > 0) {
    console.log(`${email} already exists`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const insertRequest = new sql.Request();
  insertRequest.input("email", sql.VarChar(150), email);
  insertRequest.input("passwordHash", sql.VarChar(255), passwordHash);
  insertRequest.input("role", sql.VarChar(50), role);

  await insertRequest.query(`
    INSERT INTO Users (Email, PasswordHash, Role)
    VALUES (@email, @passwordHash, @role)
  `);

  console.log(`${role} user created`);
};

const seedUsers = async () => {
  try {
    await connectDatabase();

    await createUserIfMissing("admin@smartpos.com", "admin123", "Admin");

    await createUserIfMissing("cashier@smartpos.com", "cashier123", "Cashier");

    console.log("User seeding completed");
    await sql.close();
  } catch (error) {
    console.error("User seeding failed:", error.message);
    await sql.close();
    process.exit(1);
  }
};

seedUsers();
