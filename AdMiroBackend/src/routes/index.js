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

// Auth routes (will be added in Phase 2)
router.use("/auth", require("./authRoutes"));

// Displays routes (will be added in Phase 4)
// router.use('/displays', require('./displays'));

// Ads routes (will be added in Phase 5)
// router.use('/ads', require('./ads'));

// Loops routes (will be added in Phase 6)
// router.use('/loops', require('./loops'));

// Analytics routes (will be added in Phase 7)
// router.use('/analytics', require('./analytics'));

// Users routes (will be added in Phase 10)
// router.use('/users', require('./users'));

module.exports = router;
