const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  createDisplayLoop,
  getLoopsByDisplay,
  getLoopById,
  updateDisplayLoop,
  deleteDisplayLoop,
  reorderLoopAdvertisements,
} = require("../controllers/displayLoopsController");

/**
 * Display Loop Routes
 * All routes require authentication
 */

// POST /api/loops - Create a new display loop
router.post("/", verifyToken, createDisplayLoop);

// GET /api/loops/:id - Get a single loop by ID
router.get("/:id", verifyToken, getLoopById);

// GET /api/displays/:displayId/loops - Get all loops for a display
router.get("/displays/:displayId/loops", verifyToken, getLoopsByDisplay);

// PUT /api/loops/:id - Update a loop
router.put("/:id", verifyToken, updateDisplayLoop);

// PUT /api/loops/:id/reorder - Reorder advertisements in a loop
router.put("/:id/reorder", verifyToken, reorderLoopAdvertisements);

// DELETE /api/loops/:id - Delete a loop
router.delete("/:id", verifyToken, deleteDisplayLoop);

module.exports = router;
