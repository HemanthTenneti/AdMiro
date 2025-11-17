import express from "express";
import * as profileController from "../controllers/profileController.js";
import { auth } from "../middleware/auth.js";
import { uploadProfilePicture } from "../middleware/upload.js";

const router = express.Router();

// All profile routes require authentication
router.use(auth);

// Get user profile
router.get("/", profileController.getUserProfile);

// Update user profile (firstName, lastName)
router.put("/", profileController.updateUserProfile);

// Update user email
router.put("/email", profileController.updateUserEmail);

// Change user password
router.put("/password", profileController.changeUserPassword);

// Upload profile picture
router.post(
  "/picture",
  uploadProfilePicture.single("profilePicture"),
  profileController.uploadProfilePicture
);

export default router;
