/**
 * Helper utility functions
 */

/**
 * Format error response
 */
const formatErrorResponse = (message, error = null, details = null) => {
  return {
    success: false,
    message,
    error: error ? error.toString() : null,
    details,
  };
};

/**
 * Format success response
 */
const formatSuccessResponse = (data = null, message = "Success") => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Calculate pagination values
 */
const calculatePagination = (page = 1, limit = 10, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), maxLimit);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

/**
 * Check if valid MongoDB ID
 */
const isValidMongoId = id => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Detect if input is email or username
 */
const isEmail = input => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

/**
 * Generate pagination metadata
 */
const generatePaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    currentPage: page,
    totalPages,
    pageSize: limit,
    total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  formatErrorResponse,
  formatSuccessResponse,
  calculatePagination,
  isValidMongoId,
  isEmail,
  generatePaginationMeta,
};
