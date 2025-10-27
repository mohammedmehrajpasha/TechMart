const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// For debugging
console.log("Current directory:", process.cwd());
console.log("Environment Variables:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
});

// Use hardcoded values temporarily to test connection
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "meraj",
  database: "Store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
    return true;
  } catch (err) {
    console.error("❌ Database connection error:", {
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage,
      sqlState: err.sqlState,
    });
    return false;
  }
};

testConnection();

module.exports = pool;
