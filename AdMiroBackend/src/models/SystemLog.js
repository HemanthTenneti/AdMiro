import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["create", "update", "delete", "status_change", "other"],
      required: [true, "Action is required"],
    },
    entityType: {
      type: String,
      enum: ["display", "advertisement", "loop", "user", "system"],
      required: [true, "Entity type is required"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Entity ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    details: {
      description: String,
      changes: mongoose.Schema.Types.Mixed, // For storing what was changed
      metadata: mongoose.Schema.Types.Mixed, // Additional context
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for efficient querying
systemLogSchema.index({ userId: 1, createdAt: -1 });
systemLogSchema.index({ entityType: 1, entityId: 1 });
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ action: 1, entityType: 1 });

export default mongoose.model("SystemLog", systemLogSchema);
