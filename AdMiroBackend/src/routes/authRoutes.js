const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", authController.login);

/**
 * POST /api/auth/refresh-token
 * Refresh access token
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", authController.logout);

/**
 * GET /api/auth/me
 * Get current user profile (protected route)
 */
router.get("/me", verifyToken, authController.getCurrentUser);

module.exports = router;
