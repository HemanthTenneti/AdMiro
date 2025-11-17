import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", login);

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token from request body
 */
router.post("/refresh-token", refreshAccessToken);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", logout);

/**
 * GET /api/auth/me
 * Get current user profile (protected route)
 */
router.get("/me", verifyToken, getCurrentUser);

export default router;
