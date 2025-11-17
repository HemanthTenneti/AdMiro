const express = require("express");

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
router.use("/auth", require("./authRoutes"));
router.use("/auth", require("./googleAuthRoutes"));

// Displays routes
router.use("/displays", require("./displaysRoutes"));

// Advertisements routes
router.use("/ads", require("./advertisementsRoutes"));

// Loops routes (will be added in Phase 6)
// router.use('/loops', require('./loops'));

// Analytics routes (will be added in Phase 7)
// router.use('/analytics', require('./analytics'));

// Users routes (will be added in Phase 10)
// router.use('/users', require('./users'));

module.exports = router;
