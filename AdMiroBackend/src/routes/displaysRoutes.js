import express from "express";
import {
  createDisplay,
  getDisplays,
  getDisplayById,
  updateDisplay,
  deleteDisplay,
  registerDisplayDevice,
  getDisplayByToken,
  reportDisplayStatus,
  loginDisplay,
  assignDisplayAdmin,
  getAllConnectionRequests,
  approveConnectionRequest,
  rejectConnectionRequest,
  getDisplayLoop,
  assignLoopToDisplay,
  triggerDisplayRefresh,
  checkDisplayRefresh,
} from "../controllers/displaysController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/displays/connection-requests/all
 * Get all connection requests
 * Auth: Required
 * Query: { page?, limit?, status? }
 */
router.get("/connection-requests/all", verifyToken, getAllConnectionRequests);

/**
 * POST /api/displays/connection-requests/:requestId/approve
 * Approve a connection request
 * Auth: Required
 * Params: { requestId }
 */
router.post(
  "/connection-requests/:requestId/approve",
  verifyToken,
  approveConnectionRequest
);

/**
 * POST /api/displays/connection-requests/:requestId/reject
 * Reject a connection request
 * Auth: Required
 * Params: { requestId }
 * Body: { rejectionReason? }
 */
router.post(
  "/connection-requests/:requestId/reject",
  verifyToken,
  rejectConnectionRequest
);

/**
 * POST /api/displays
 * Create a new display
 * Auth: Required
 * Body: { displayName, location, assignedAdmin?, resolution?, configuration? }
 */
router.post("/", verifyToken, createDisplay);

/**
 * POST /api/displays/register-self
 * Register a browser-based display device (no auth required)
 * Body: { displayName, location, displayId?, password?, resolution?, browserInfo? }
 */
router.post("/register-self", registerDisplayDevice);

/**
 * POST /api/displays/login-display
 * Login to a registered display using displayId and password
 * Auth: Not required
 * Body: { displayId, password }
 */
router.post("/login-display", loginDisplay);

/**
 * GET /api/displays
 * Get all displays for the current user
 * Auth: Required
 * Query: { page?, limit?, status? }
 */
router.get("/", verifyToken, getDisplays);

/**
 * GET /api/displays/:id
 * Get a single display by ID
 * Auth: Required (must be owner)
 */
router.get("/:id", verifyToken, getDisplayById);

/**
 * GET /api/displays/by-token/:token
 * Get display by connection token (for browser displays)
 * Auth: Not required (public endpoint for displays)
 */
router.get("/by-token/:token", getDisplayByToken);

/**
 * GET /api/displays/loop/:token
 * Get display's current loop with advertisements
 * Auth: Not required (public endpoint for displays)
 * Params: { token } - connection token
 */
router.get("/loop/:token", getDisplayLoop);

/**
 * POST /api/displays/report-status
 * Report display status (heartbeat from browser display)
 * Auth: Not required (uses connection token)
 * Body: { connectionToken, status, currentAdPlaying?, isPlaying? }
 */
router.post("/report-status", reportDisplayStatus);

/**
 * PUT /api/displays/:id
 * Update a display
 * Auth: Required (must be owner)
 * Body: { displayName?, location?, status?, resolution?, configuration? }
 */
router.put("/:id", verifyToken, updateDisplay);

/**
 * PUT /api/displays/:id/assign-admin
 * Assign an admin to a pending display (approve and assign)
 * Auth: Required (admin assigns themselves)
 * Body: { }
 */
router.put("/:id/assign-admin", verifyToken, assignDisplayAdmin);

/**
 * PUT /api/displays/:displayId/assign-loop
 * Assign a loop to a display
 * Auth: Required (must be display owner)
 * Body: { loopId }
 */
router.put("/:displayId/assign-loop", verifyToken, assignLoopToDisplay);

/**
 * POST /api/displays/:displayId/trigger-refresh
 * Trigger a refresh for a specific display
 * Auth: Required (must be display owner)
 * Params: { displayId }
 */
router.post("/:displayId/trigger-refresh", verifyToken, triggerDisplayRefresh);

/**
 * GET /api/displays/check-refresh/:displayId
 * Check if display needs to refresh (and clear flag if true)
 * Auth: Not required (public endpoint for displays)
 * Params: { displayId }
 */
router.get("/check-refresh/:displayId", checkDisplayRefresh);

/**
 * DELETE /api/displays/:id
 * Delete a display
 * Auth: Required (must be owner)
 */
router.delete("/:id", verifyToken, deleteDisplay);

export default router;
