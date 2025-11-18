import mongoose from "mongoose";

const displayConnectionRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: [true, "Request ID is required"],
      unique: true,
    },
    displayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Display",
      required: [true, "Display ID is required"],
    },
    displayName: {
      type: String,
      default: null,
    },
    displayLocation: {
      type: String,
      default: null,
    },
    firmwareVersion: {
      type: String,
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "DisplayConnectionRequest",
  displayConnectionRequestSchema
);
