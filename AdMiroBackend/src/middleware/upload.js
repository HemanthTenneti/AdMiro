import multer from "multer";
import path from "path";

// Store files in memory as base64 - no disk storage needed
const memoryStorage = multer.memoryStorage();

// File filter to only accept images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only images and videos are allowed."),
      false
    );
  }
};

// Configure multer for media uploads - stores in memory
export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for media
  },
});

// Profile picture upload (images only)
const profilePictureFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images are allowed for profile pictures."
      ),
      false
    );
  }
};

export const uploadProfilePicture = multer({
  storage: memoryStorage,
  fileFilter: profilePictureFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
});
