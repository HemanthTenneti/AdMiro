import express from "express";
import passport from "passport";
import AuthService from "../services/authService.js";
import {
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/helpers.js";

const router = express.Router();

/**
 * Google OAuth Login/Signup - Initiate
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * Google OAuth Callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // User is authenticated by passport
      const user = req.user;

      // Generate tokens
      const accessToken = AuthService.generateToken(user._id);
      const refreshToken = AuthService.generateRefreshToken(user._id);

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Redirect to frontend with tokens
      // In production, you might want to use a query string or post-message
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      // Send tokens via query params (less secure - for demo only)
      // In production, use a secure method like sending to a page that posts to parent
      res.redirect(
        `${frontendUrl}/auth-callback?accessToken=${accessToken}&userId=${user._id}&username=${user.username}&email=${user.email}&firstName=${user.firstName}&lastName=${user.lastName}`
      );
    } catch (error) {
      console.error("❌ Google OAuth callback error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/login?error=auth_failed`
      );
    }
  }
);

/**
 * Logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json(formatSuccessResponse({}, "Logged out successfully"));
});

export default router;
