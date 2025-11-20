import "dotenv/config.js";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import passportConfig from "./config/passport.js";
import connectDB from "./config/database.js";
import corsMiddleware from "./middleware/cors.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";
import logRequest from "./middleware/logger.js";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Middleware
 */
// Security
app.use(helmet());

// Logging
app.use(morgan("dev"));

// Custom request/response logger
app.use(logRequest);

// CORS
app.use(corsMiddleware);

// Serve static files (media uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Session for Passport
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passportConfig.initialize());
app.use(passportConfig.session());

// Body parsing (must come before rate limiting)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api/", apiLimiter);

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

export default app;
