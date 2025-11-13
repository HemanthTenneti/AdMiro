// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh-token",
    GOOGLE: "/auth/google",
  },
  DISPLAYS: {
    LIST: "/displays",
    GET: id => `/displays/${id}`,
    CREATE: "/displays",
    UPDATE: id => `/displays/${id}`,
    DELETE: id => `/displays/${id}`,
    STATUS: id => `/displays/${id}/status`,
  },
  ADS: {
    LIST: "/ads",
    GET: id => `/ads/${id}`,
    CREATE: "/ads",
    UPDATE: id => `/ads/${id}`,
    DELETE: id => `/ads/${id}`,
    STATUS: id => `/ads/${id}/status`,
  },
  LOOPS: {
    LIST: "/loops",
    GET: id => `/loops/${id}`,
    CREATE: "/loops",
    UPDATE: id => `/loops/${id}`,
    DELETE: id => `/loops/${id}`,
  },
  ANALYTICS: {
    SUMMARY: "/analytics/summary",
    DISPLAY: id => `/analytics/displays/${id}`,
    AD: id => `/analytics/ads/${id}`,
    TRENDS: "/analytics/trends",
  },
};

// Page routes
export const PAGE_ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/dashboard",
  DISPLAYS: "/dashboard/displays",
  DISPLAY_DETAIL: id => `/dashboard/displays/${id}`,
  ADS: "/dashboard/ads",
  AD_DETAIL: id => `/dashboard/ads/${id}`,
  LOOPS: "/dashboard/loops",
  LOOP_DETAIL: id => `/dashboard/loops/${id}`,
  ANALYTICS: "/dashboard/analytics",
  PROFILE: "/dashboard/profile",
  USERS: "/dashboard/users",
};

// Status options
export const STATUS_OPTIONS = {
  DISPLAY: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "offline", label: "Offline" },
    { value: "pending", label: "Pending" },
  ],
  AD: [
    { value: "active", label: "Active" },
    { value: "scheduled", label: "Scheduled" },
    { value: "expired", label: "Expired" },
    { value: "archived", label: "Archived" },
  ],
};
