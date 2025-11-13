const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    displayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Display",
      required: [true, "Display ID is required"],
    },
    adId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advertisement",
      required: [true, "Ad ID is required"],
    },
    loopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisplayLoop",
      required: [true, "Loop ID is required"],
    },
    impressions: {
      type: Number,
      default: 0,
    },
    engagementMetrics: {
      clicks: {
        type: Number,
        default: 0,
      },
      interactions: {
        type: Number,
        default: 0,
      },
      dwellTime: {
        type: Number, // in seconds
        default: 0,
      },
    },
    viewDuration: {
      type: Number, // in seconds - how long the ad was actually displayed
      default: 0,
    },
    completedViews: {
      type: Number, // Views where entire ad was shown
      default: 0,
    },
    partialViews: {
      type: Number, // Views where only part of ad was shown
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: Date,
      required: true,
      index: true, // Add index for faster queries
    },
    metadata: {
      deviceType: String,
      location: String,
      weatherCondition: String,
      crowdDensity: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analytics", analyticsSchema);
