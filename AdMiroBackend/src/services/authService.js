const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  // Generate JWT token
  static generateToken(userId, expiresIn = "7d") {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn,
    });
  }

  // Generate refresh token
  static generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  }

  // Register user
  static async register(username, email, password, firstName, lastName) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      const field = existingUser.username === username ? "username" : "email";
      throw new Error(`User with this ${field} already exists`);
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: "advertiser", // Default role
    });

    await newUser.save();

    // Generate tokens
    const accessToken = this.generateToken(newUser._id);
    const refreshToken = this.generateRefreshToken(newUser._id);

    return {
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Login user
  static async login(usernameOrEmail, password) {
    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    }).select("+password");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error("Account is inactive");
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      const newAccessToken = this.generateToken(user._id);

      return {
        accessToken: newAccessToken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

module.exports = AuthService;
