import axios from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 15000, // 15 second timeout
});

// Retry interceptor for failed requests
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;

    // Don't retry if no config
    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retry count
    config.retryCount = config.retryCount || 0;
    config.retryCount += 1;

    // Max 2 retries (total 3 attempts)
    if (config.retryCount > 2) {
      return Promise.reject(error);
    }

    // Wait before retrying (exponential backoff)
    const delayMs = 1000 * Math.pow(2, config.retryCount - 1); // 1s, 2s
    console.log(`⏳ Retry attempt ${config.retryCount} after ${delayMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, delayMs));

    // Retry the request
    return axiosInstance(config);
  }
);

export default axiosInstance;
