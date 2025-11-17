import axios from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 15000, // 15 second timeout
});

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  config => {
    // Add token from localStorage to Authorization header
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response error handler
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
