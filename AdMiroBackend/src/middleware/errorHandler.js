const { formatErrorResponse } = require("../utils/helpers");

/**
 * Central error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    return res
      .status(statusCode)
      .json(formatErrorResponse("Validation Error", null, errors));
  }

  // Mongoose cast error (invalid ID)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  return res.status(statusCode).json(formatErrorResponse(message, err.message));
};

module.exports = errorHandler;
