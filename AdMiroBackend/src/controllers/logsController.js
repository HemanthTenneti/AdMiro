import * as loggingService from "../services/loggingService.js";
import SystemLog from "../models/SystemLog.js";

/**
 * Get all logs with filters and pagination
 * GET /api/logs
 * Query params: ?page=1&limit=10&entityType=display&action=create&startDate=2025-01-01&endDate=2025-01-31
 */
export const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      entityType,
      action,
      userId,
      entityId,
      startDate,
      endDate,
    } = req.query;

    const filters = {};
    if (entityType) filters.entityType = entityType;
    if (action) filters.action = action;
    if (userId) filters.userId = userId;
    if (entityId) filters.entityId = entityId;
    if (startDate || endDate) {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    const result = await loggingService.getLogs(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Logs fetched successfully",
      data: {
        logs: result.logs,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error("Error getting logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching logs",
      error: error.message,
    });
  }
};

/**
 * Get logs for a specific entity
 * GET /api/logs/entity/:entityType/:entityId
 */
export const getEntityLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate entityType
    const validEntityTypes = [
      "display",
      "advertisement",
      "loop",
      "user",
      "system",
    ];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity type. Valid types: ${validEntityTypes.join(
          ", "
        )}`,
      });
    }

    const result = await loggingService.getEntityLogs(
      entityType,
      entityId,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Entity logs fetched successfully",
      data: {
        logs: result.logs,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error("Error getting entity logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching entity logs",
      error: error.message,
    });
  }
};

/**
 * Get activity summary
 * GET /api/logs/summary
 * Query params: ?hours=24 (default)
 */
export const getActivitySummary = async (req, res) => {
  try {
    const { hours = 24 } = req.query;

    const summary = await loggingService.getActivitySummary(parseInt(hours));

    res.status(200).json({
      success: true,
      message: "Activity summary fetched successfully",
      data: {
        summary,
        timeFrame: `Last ${hours} hours`,
      },
    });
  } catch (error) {
    console.error("Error getting activity summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity summary",
      error: error.message,
    });
  }
};

/**
 * Delete a specific log
 * DELETE /api/logs/:logId
 */
export const deleteLog = async (req, res) => {
  try {
    const { logId } = req.params;

    // Verify log exists
    const log = await SystemLog.findById(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    const deletedLog = await loggingService.deleteLog(logId);

    res.status(200).json({
      success: true,
      message: "Log deleted successfully",
      data: {
        deletedLog,
      },
    });
  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting log",
      error: error.message,
    });
  }
};

/**
 * Get recent logs for dashboard
 * GET /api/logs/recent
 * Query params: ?limit=5
 */
export const getRecentLogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const logs = await SystemLog.find()
      .populate("userId", "username email firstName lastName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Recent logs fetched successfully",
      data: {
        logs,
      },
    });
  } catch (error) {
    console.error("Error getting recent logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent logs",
      error: error.message,
    });
  }
};
