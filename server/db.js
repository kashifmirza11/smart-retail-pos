const sql = require("mssql/msnodesqlv8");

const databaseConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

const connectDatabase = async () => {
  try {
    const pool = await sql.connect(databaseConfig);
    console.log("SQL Server database connected");
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

module.exports = {
  sql,
  connectDatabase,
};
