import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    adId: {
      type: String,
      required: [true, "Ad ID is required"],
      unique: true,
    },
    adName: {
      type: String,
      required: [true, "Ad name is required"],
      trim: true,
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Advertiser is required"],
    },
    mediaUrl: {
      type: String,
      required: [true, "Media URL is required"],
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type is required"],
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: Number, // in seconds
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 second"],
      max: [3600, "Duration cannot exceed 1 hour"],
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "expired", "paused"],
      default: "active",
    },
    targetAudience: {
      type: String,
      default: "general",
    },
    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Advertisement", advertisementSchema);
