import SystemLog from "../models/SystemLog.js";

/**
 * Create a system log entry
 */
export const createLog = async logData => {
  try {
    console.log("Creating log with data:", {
      userId: logData.userId,
      userIdType: typeof logData.userId,
      action: logData.action,
      entityType: logData.entityType,
    });

    const log = new SystemLog(logData);
    await log.save();

    console.log("Log saved successfully:", {
      _id: log._id,
      userId: log.userId,
      userIdType: typeof log.userId,
    });

    return log;
  } catch (error) {
    console.error("Error creating log:", error);
    throw error;
  }
};

/**
 * Fetch logs with filters and pagination
 */
export const getLogs = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Build query filter
    const query = {};
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.action) query.action = filters.action;
    if (filters.userId) query.userId = filters.userId;
    if (filters.entityId) query.entityId = filters.entityId;

    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
    }

    // Get total count for pagination
    const total = await SystemLog.countDocuments(query);

    // Fetch logs
    const logs = await SystemLog.find(query)
      .populate("userId", "username email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};

/**
 * Get logs for a specific entity
 */
export const getEntityLogs = async (
  entityType,
  entityId,
  page = 1,
  limit = 10
) => {
  try {
    return await getLogs({ entityType, entityId }, page, limit);
  } catch (error) {
    console.error("Error fetching entity logs:", error);
    throw error;
  }
};

/**
 * Get logs for a specific user
 */
export const getUserLogs = async (userId, page = 1, limit = 10) => {
  try {
    return await getLogs({ userId }, page, limit);
  } catch (error) {
    console.error("Error fetching user logs:", error);
    throw error;
  }
};

/**
 * Delete a log entry
 */
export const deleteLog = async logId => {
  try {
    const deletedLog = await SystemLog.findByIdAndDelete(logId);
    return deletedLog;
  } catch (error) {
    console.error("Error deleting log:", error);
    throw error;
  }
};

/**
 * Archive old logs (delete logs older than specified days)
 */
export const archiveOldLogs = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await SystemLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(
      `Archived ${result.deletedCount} logs older than ${daysOld} days`
    );
    return result.deletedCount;
  } catch (error) {
    console.error("Error archiving logs:", error);
    throw error;
  }
};

/**
 * Get activity summary (count by action and entity type)
 */
export const getActivitySummary = async (hoursBack = 24) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursBack);

    const summary = await SystemLog.aggregate([
      {
        $match: {
          createdAt: { $gte: cutoffDate },
        },
      },
      {
        $group: {
          _id: {
            action: "$action",
            entityType: "$entityType",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return summary;
  } catch (error) {
    console.error("Error getting activity summary:", error);
    throw error;
  }
};

/**
 * Clear all logs (use with caution)
 */
export const clearAllLogs = async () => {
  try {
    const result = await SystemLog.deleteMany({});
    console.log(`Cleared ${result.deletedCount} logs`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error clearing logs:", error);
    throw error;
  }
};
