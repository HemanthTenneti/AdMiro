import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus,
  getPublicAdvertisements,
} from "../controllers/advertisementsController.js";

const router = express.Router();

/**
 * Advertisement Routes
 * Most routes require authentication via verifyToken middleware
 */

// POST /api/ads - Create a new advertisement
router.post("/", verifyToken, createAdvertisement);

// GET /api/ads/public - Get all active advertisements (public endpoint for displays)
router.get("/public", getPublicAdvertisements);

// GET /api/ads - Get all advertisements for the current user (with pagination, sorting, filtering)
router.get("/", verifyToken, getAdvertisements);

// GET /api/ads/:id - Get a single advertisement by ID
router.get("/:id", verifyToken, getAdvertisementById);

// PUT /api/ads/:id - Update an advertisement
router.put("/:id", verifyToken, updateAdvertisement);

// PUT /api/ads/:id/status - Update advertisement status
router.put("/:id/status", verifyToken, updateAdvertisementStatus);

// DELETE /api/ads/:id - Delete an advertisement
router.delete("/:id", verifyToken, deleteAdvertisement);

export default router;
