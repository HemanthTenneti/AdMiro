require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const corsMiddleware = require("./middleware/cors");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 8000;

/**
 * Middleware
 */
// Security
app.use(helmet());

// Logging
app.use(morgan("dev"));

// CORS
app.use(corsMiddleware);

// Rate limiting
app.use("/api/", apiLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */
app.use("/api", routes);

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Error handling middleware (must be last)
 */
app.use(errorHandler);

/**
 * Database connection and server startup
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  AdMiro Backend Server                 ║
╠════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(24)} ║
║  Port: ${PORT.toString().padEnd(31)} ║
║  Database: ${(
        process.env.DATABASE_URL?.split("/")[3]?.split("?")[0] || "Unknown"
      ).padEnd(27)} ║
║  Status: Running                       ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

startServer();

module.exports = app;
