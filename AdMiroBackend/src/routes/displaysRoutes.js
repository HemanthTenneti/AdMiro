const express = require("express");
const router = express.Router();
const {
  createDisplay,
  getDisplays,
  getDisplayById,
  updateDisplay,
  deleteDisplay,
  registerDisplayDevice,
  getDisplayByToken,
  reportDisplayStatus,
  loginDisplay,
} = require("../controllers/displaysController");
const { verifyToken } = require("../middleware/auth");

/**
 * POST /api/displays
 * Create a new display
 * Auth: Required
 * Body: { displayName, location, assignedAdmin?, resolution?, configuration? }
 */
router.post("/", verifyToken, createDisplay);

/**
 * POST /api/displays/register-self
 * Register a browser-based display device (no auth required)
 * Body: { displayName, location, resolution?, browserInfo? }
 */
router.post("/register-self", registerDisplayDevice);

/**
 * POST /api/displays/login-display
 * Login to a registered display using displayId and connectionToken
 * Auth: Not required
 * Body: { displayId, connectionToken }
 */
router.post("/login-display", loginDisplay);

/**
 * GET /api/displays
 * Get all displays for the current user
 * Auth: Required
 * Query: { page?, limit?, status? }
 */
router.get("/", verifyToken, getDisplays);

/**
 * GET /api/displays/:id
 * Get a single display by ID
 * Auth: Required (must be owner)
 */
router.get("/:id", verifyToken, getDisplayById);

/**
 * GET /api/displays/by-token/:token
 * Get display by connection token (for browser displays)
 * Auth: Not required (public endpoint for displays)
 */
router.get("/by-token/:token", getDisplayByToken);

/**
 * POST /api/displays/report-status
 * Report display status (heartbeat from browser display)
 * Auth: Not required (uses connection token)
 * Body: { connectionToken, status, currentAdPlaying?, isPlaying? }
 */
router.post("/report-status", reportDisplayStatus);

/**
 * PUT /api/displays/:id
 * Update a display
 * Auth: Required (must be owner)
 * Body: { displayName?, location?, status?, resolution?, configuration? }
 */
router.put("/:id", verifyToken, updateDisplay);

/**
 * DELETE /api/displays/:id
 * Delete a display
 * Auth: Required (must be owner)
 */
router.delete("/:id", verifyToken, deleteDisplay);

module.exports = router;
