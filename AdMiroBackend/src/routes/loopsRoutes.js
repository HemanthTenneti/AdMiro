import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getAllLoops,
  createDisplayLoop,
  getLoopsByDisplay,
  getLoopById,
  updateDisplayLoop,
  deleteDisplayLoop,
  reorderLoopAdvertisements,
} from "../controllers/displayLoopsController.js";

const router = express.Router();

/**
 * Display Loop Routes
 * All routes require authentication
 */

// GET /api/loops - Get all loops for the authenticated user
router.get("/", verifyToken, getAllLoops);

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

export default router;
