import express from "express";
import * as logsController from "../controllers/logsController.js";

const router = express.Router();

// Get all logs with filters and pagination
router.get("/", logsController.getLogs);

// Get recent logs for dashboard
router.get("/recent", logsController.getRecentLogs);

// Get activity summary
router.get("/summary", logsController.getActivitySummary);

// Get logs for a specific entity
router.get("/entity/:entityType/:entityId", logsController.getEntityLogs);

// Delete a specific log
router.delete("/:logId", logsController.deleteLog);

export default router;
