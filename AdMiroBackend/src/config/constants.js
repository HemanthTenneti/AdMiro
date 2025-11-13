module.exports = {
  // User Roles
  ROLES: {
    ADMIN: "admin",
    ADVERTISER: "advertiser",
  },

  // Display Status
  DISPLAY_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    OFFLINE: "offline",
    PENDING: "pending",
  },

  // Advertisement Status
  AD_STATUS: {
    ACTIVE: "active",
    SCHEDULED: "scheduled",
    EXPIRED: "expired",
    ARCHIVED: "archived",
  },

  // Connection Request Status
  CONNECTION_REQUEST_STATUS: {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },

  // Media Types
  MEDIA_TYPES: {
    IMAGE: "image",
    VIDEO: "video",
  },

  // Loop Rotation Types
  ROTATION_TYPES: {
    SEQUENTIAL: "sequential",
    RANDOM: "random",
    WEIGHTED: "weighted",
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Response Messages
  MESSAGES: {
    SUCCESS: "Operation successful",
    ERROR: "An error occurred",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Forbidden",
    NOT_FOUND: "Resource not found",
    VALIDATION_ERROR: "Validation error",
  },
};
