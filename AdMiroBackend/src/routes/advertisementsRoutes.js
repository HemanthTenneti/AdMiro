import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
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

// Middleware to handle optional file upload
const handleOptionalFileUpload = (req, res, next) => {
  // Use multer single upload, but don't fail if no file is provided
  upload.single("media")(req, res, err => {
    // If error is "Unexpected field", it means no file was sent (which is OK for link mode)
    if (err && !err.message.includes("Unexpected")) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// POST /api/ads - Create a new advertisement (with file upload or link)
router.post("/", verifyToken, handleOptionalFileUpload, createAdvertisement);

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
