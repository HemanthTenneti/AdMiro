import express from "express";
import authRoutes from "./authRoutes.js";
import googleAuthRoutes from "./googleAuthRoutes.js";
import displaysRoutes from "./displaysRoutes.js";
import advertisementsRoutes from "./advertisementsRoutes.js";
import loopsRoutes from "./loopsRoutes.js";

const router = express.Router();

/**
 * API Routes
 */

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AdMiro Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (traditional + Google OAuth)
router.use("/auth", authRoutes);
router.use("/auth", googleAuthRoutes);

// Displays routes
router.use("/displays", displaysRoutes);

// Advertisements routes
router.use("/ads", advertisementsRoutes);

// Loops routes
router.use("/loops", loopsRoutes);

// Analytics routes (will be added in Phase 7)
// router.use('/analytics', require('./analytics'));

// Users routes (will be added in Phase 10)
// router.use('/users', require('./users'));

export default router;
