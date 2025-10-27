const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/mongodb.config");
const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize databases
const initializeDatabases = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB initialization complete");

    // Test MySQL connection
    const connection = await db.getConnection();
    console.log("✅ MySQL Connected");
    connection.release();

    // Start server after successful database connections
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/products", require("./routes/products"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/sales", require("./routes/Sales"));

// Initialize databases and start server
initializeDatabases();
