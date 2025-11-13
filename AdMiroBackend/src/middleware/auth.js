const jwt = require("jsonwebtoken");
const { formatErrorResponse } = require("../utils/helpers");
const { ROLES } = require("../config/constants");

/**
 * Verify JWT token middleware
 */
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(formatErrorResponse("No token provided. Please log in."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(formatErrorResponse("Token has expired. Please log in again."));
    }
    return res
      .status(401)
      .json(formatErrorResponse("Invalid token. Please log in again."));
  }
};

/**
 * Check user role middleware
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(formatErrorResponse("Not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(formatErrorResponse("Insufficient permissions"));
    }

    next();
  };
};

/**
 * Admin only middleware
 */
const adminOnly = (req, res, next) => {
  return checkRole(ROLES.ADMIN)(req, res, next);
};

module.exports = {
  verifyToken,
  checkRole,
  adminOnly,
};
