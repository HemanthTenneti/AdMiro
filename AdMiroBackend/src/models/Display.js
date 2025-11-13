const mongoose = require("mongoose");

const displaySchema = new mongoose.Schema(
  {
    displayId: {
      type: String,
      required: [true, "Display ID is required"],
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "inactive"],
      default: "offline",
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned admin is required"],
    },
    resolution: {
      width: {
        type: Number,
        default: 1920,
      },
      height: {
        type: Number,
        default: 1080,
      },
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    firmwareVersion: {
      type: String,
      default: "1.0.0",
    },
    configuration: {
      brightness: {
        type: Number,
        min: 0,
        max: 100,
        default: 100,
      },
      volume: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      refreshRate: {
        type: Number,
        default: 60, // in Hz
      },
      orientation: {
        type: String,
        enum: ["portrait", "landscape"],
        default: "landscape",
      },
    },
    connectionToken: {
      type: String,
      required: true,
      unique: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    currentLoop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisplayLoop",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Display", displaySchema);
