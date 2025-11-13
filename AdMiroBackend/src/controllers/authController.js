const AuthService = require("../services/authService");
const User = require("../models/User");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/helpers");

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, firstName, lastName } =
      req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json(formatErrorResponse("All fields are required"));
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json(formatErrorResponse("Passwords do not match"));
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Password must be at least 6 characters long")
        );
    }

    // Register user
    const result = await AuthService.register(
      username,
      email,
      password,
      firstName || "",
      lastName || ""
    );

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(201).json(
      formatSuccessResponse(
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "User registered successfully"
      )
    );
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    return res.status(400).json(formatErrorResponse(error.message));
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Validation
    if (!usernameOrEmail || !password) {
      return res
        .status(400)
        .json(formatErrorResponse("Username/Email and password are required"));
    }

    // Login user
    const result = await AuthService.login(usernameOrEmail, password);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json(
      formatSuccessResponse(
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Login successful"
      )
    );
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return res.status(401).json(formatErrorResponse(error.message));
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res
        .status(401)
        .json(formatErrorResponse("No refresh token provided"));
    }

    const result = await AuthService.refreshAccessToken(token);

    return res.status(200).json(
      formatSuccessResponse(
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Token refreshed successfully"
      )
    );
  } catch (error) {
    return res.status(401).json(formatErrorResponse(error.message));
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    return res
      .status(200)
      .json(formatSuccessResponse(null, "Logout successful"));
  } catch (error) {
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get current user profile
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await AuthService.getUserById(req.user.userId);

    return res
      .status(200)
      .json(formatSuccessResponse(user, "User retrieved successfully"));
  } catch (error) {
    return res.status(404).json(formatErrorResponse(error.message));
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
};
