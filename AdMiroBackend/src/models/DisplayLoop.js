const mongoose = require("mongoose");

const displayLoopSchema = new mongoose.Schema(
  {
    loopId: {
      type: String,
      required: [true, "Loop ID is required"],
      unique: true,
    },
    loopName: {
      type: String,
      required: [true, "Loop name is required"],
      trim: true,
    },
    displayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Display",
      required: [true, "Display ID is required"],
    },
    advertisements: [
      {
        adId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Advertisement",
          required: true,
        },
        loopOrder: {
          type: Number,
          required: true,
        },
      },
    ],
    rotationType: {
      type: String,
      enum: ["sequential", "random", "scheduled"],
      default: "sequential",
    },
    totalDuration: {
      type: Number, // in seconds - sum of all ad durations
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DisplayLoop", displayLoopSchema);
