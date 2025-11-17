const AuthService = require("../services/authService");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/helpers");

/**
 * Register a new user
 * Body: { username, email, password, confirmPassword, firstName?, lastName? }
 * Returns: { user, accessToken, refreshToken }
 */
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, firstName, lastName } =
      req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Username, email, and password are required.")
        );
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json(formatErrorResponse("Passwords do not match."));
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json(formatErrorResponse("Password must be at least 6 characters."));
    }

    // Register user via service
    const result = await AuthService.register(
      username,
      email,
      password,
      firstName || "",
      lastName || ""
    );

    // Return user and tokens
    return res.status(201).json(
      formatSuccessResponse(
        {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        "User registered successfully. Use accessToken in Authorization header."
      )
    );
  } catch (error) {
    console.error("❌ Register error:", error.message);
    return res.status(400).json(formatErrorResponse(error.message));
  }
};

/**
 * Login user
 * Body: { usernameOrEmail, password }
 * Returns: { user, accessToken, refreshToken }
 */
const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Validation
    if (!usernameOrEmail || !password) {
      return res
        .status(400)
        .json(formatErrorResponse("Username/email and password are required."));
    }

    // Login user via service
    const result = await AuthService.login(usernameOrEmail, password);

    // Return user and tokens
    return res.status(200).json(
      formatSuccessResponse(
        {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
        "Login successful. Use accessToken in Authorization header."
      )
    );
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return res.status(401).json(formatErrorResponse(error.message));
  }
};

/**
 * Refresh access token
 * Body: { refreshToken }
 * Returns: { accessToken, user }
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json(formatErrorResponse("Refresh token is required."));
    }

    // Refresh token via service
    const result = await AuthService.refreshAccessToken(refreshToken);

    // Return new access token
    return res.status(200).json(
      formatSuccessResponse(
        {
          accessToken: result.accessToken,
          user: result.user,
        },
        "Token refreshed successfully."
      )
    );
  } catch (error) {
    console.error("❌ Refresh error:", error.message);
    return res.status(401).json(formatErrorResponse(error.message));
  }
};

/**
 * Logout user
 * Note: Stateless tokens - logout is client-side only. Delete tokens from localStorage.
 */
const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .json(
        formatSuccessResponse(
          null,
          "Logged out. Please delete tokens from localStorage."
        )
      );
  } catch (error) {
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get current user by ID from middleware (populated by verifyToken)
 */
const getCurrentUser = async (req, res) => {
  try {
    // req.user.userId is set by verifyToken middleware from JWT token
    const user = await AuthService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json(formatErrorResponse("User not found."));
    }

    return res
      .status(200)
      .json(formatSuccessResponse(user, "User fetched successfully."));
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
