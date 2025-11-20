import Display from "../models/Display.js";
import DisplayConnectionRequest from "../models/DisplayConnectionRequest.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import {
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/helpers.js";
import * as loggingService from "../services/loggingService.js";

/**
 * Create a new display
 * Body: { displayId, displayName, location, resolution (width, height) }
 * Returns: { display, message }
 * Auth: Required (verifyToken middleware extracts user ID)
 */
const createDisplay = async (req, res) => {
  try {
    const { displayId, displayName, location, resolution } = req.body;

    // Validation
    if (!displayId || !displayName || !location) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Display ID, display name, and location are required."
          )
        );
    }

    if (displayId.length < 3) {
      return res
        .status(400)
        .json(formatErrorResponse("Display ID must be at least 3 characters."));
    }

    if (displayName.length < 3) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Display name must be at least 3 characters.")
        );
    }

    if (location.length < 3) {
      return res
        .status(400)
        .json(formatErrorResponse("Location must be at least 3 characters."));
    }

    // Validate display ID is unique
    const existingDisplay = await Display.findOne({ displayId });
    if (existingDisplay) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Display ID already exists. Choose a different one."
          )
        );
    }

    // Validate resolution if provided
    if (resolution) {
      if (
        !resolution.width ||
        !resolution.height ||
        typeof resolution.width !== "number" ||
        typeof resolution.height !== "number" ||
        resolution.width < 100 ||
        resolution.height < 100
      ) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Resolution must include width and height (minimum 100px each)."
            )
          );
      }
    }

    // Generate connection token
    const connectionToken = uuidv4();

    // Build display object with user-provided displayId
    const displayData = {
      displayId: displayId.trim(),
      displayName: displayName.trim(),
      location: location.trim(),
      connectionToken,
      assignedAdmin: req.user.userId,
      // Use provided resolution or defaults
      resolution: resolution || { width: 1920, height: 1080 },
    };

    // Create display in database
    const newDisplay = new Display(displayData);
    await newDisplay.save();

    // Log the action
    await loggingService.createLog({
      action: "create",
      entityType: "display",
      entityId: newDisplay._id,
      userId: req.user.userId,
      details: {
        description: `Display created: ${displayId}`,
        metadata: {
          displayId,
          displayName,
          location,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Display created: ${displayId} by user ${req.user.userId}`);

    return res
      .status(201)
      .json(formatSuccessResponse(newDisplay, "Display created successfully."));
  } catch (error) {
    console.error("❌ Create display error:", error.message);

    // Handle unique constraint error (displayId or connectionToken already exists)
    if (error.code === 11000) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Display ID or connection token already exists.")
        );
    }

    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all displays for the current user
 * Query: { page?, limit?, status? }
 * Returns: { displays, pagination, message }
 * Auth: Required
 */
const getDisplays = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter - get displays assigned to current user
    const filter = { assignedAdmin: req.user.userId };
    if (status) {
      filter.status = status;
    }

    console.log(
      `🔍 Fetching displays for user ${req.user.userId} with filter:`,
      filter
    );

    const displays = await Display.find(filter)
      .populate("assignedAdmin", "firstName lastName username email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Display.countDocuments(filter);

    console.log(
      `✅ Fetched ${displays.length} displays for user ${req.user.userId}`
    );
    console.log(`   Display IDs: ${displays.map(d => d._id).join(", ")}`);

    return res.status(200).json(
      formatSuccessResponse(
        {
          displays,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            pageSize: parseInt(limit),
            total,
          },
        },
        "Displays fetched successfully."
      )
    );
  } catch (error) {
    console.error("❌ Get displays error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get a single display by ID
 * Params: { id }
 * Returns: { display, message }
 * Auth: Required
 */
const getDisplayById = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate admin info
    const display = await Display.findById(id).populate(
      "assignedAdmin",
      "firstName lastName username email"
    );

    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    // Check if user has access to this display
    // If assignedAdmin is null, assign it to the requesting user
    if (!display.assignedAdmin) {
      display.assignedAdmin = req.user.userId;
      await display.save();
      // Populate the admin info after saving
      await display.populate(
        "assignedAdmin",
        "firstName lastName username email"
      );
    }

    // Get the owner ID as a string for comparison
    const displayOwnerId = display.assignedAdmin?._id
      ? display.assignedAdmin._id.toString()
      : display.assignedAdmin?.toString?.() || display.assignedAdmin;
    const userId = req.user.userId.toString();

    console.log(`🔍 Permission check for display ${id}:`);
    console.log(`   Display owner ID: ${displayOwnerId}`);
    console.log(`   Requesting user ID: ${userId}`);
    console.log(`   Match: ${displayOwnerId === userId}`);

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to view this display."
          )
        );
    }

    console.log(`✅ Fetched display ${id} for user ${req.user.userId}`);

    return res
      .status(200)
      .json(formatSuccessResponse(display, "Display fetched successfully."));
  } catch (error) {
    console.error("❌ Get display error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Update a display
 * Params: { id }
 * Body: { displayName?, location?, status?, resolution?, configuration? }
 * Returns: { display, message }
 * Auth: Required
 */
const updateDisplay = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, location, status, resolution, configuration } =
      req.body;

    // Find display and check ownership
    const display = await Display.findById(id);

    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    // If no owner, assign to current user
    if (!display.assignedAdmin) {
      display.assignedAdmin = req.user.userId;
      await display.save();
    }

    // Compare as strings
    const displayOwnerId = display.assignedAdmin.toString();
    const userId = req.user.userId.toString();

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to update this display."
          )
        );
    }

    // Update fields
    if (displayName) {
      display.displayName = displayName.trim();
    }
    if (location) {
      display.location = location.trim();
    }
    if (status && ["online", "offline", "inactive"].includes(status)) {
      display.status = status;
    }

    // Update resolution if provided
    if (resolution) {
      if (resolution.width && typeof resolution.width === "number") {
        display.resolution.width = resolution.width;
      }
      if (resolution.height && typeof resolution.height === "number") {
        display.resolution.height = resolution.height;
      }
    }

    // Update configuration if provided
    if (configuration) {
      if (typeof configuration.brightness === "number") {
        display.configuration.brightness = Math.min(
          100,
          Math.max(0, configuration.brightness)
        );
      }
      if (typeof configuration.volume === "number") {
        display.configuration.volume = Math.min(
          100,
          Math.max(0, configuration.volume)
        );
      }
      if (typeof configuration.refreshRate === "number") {
        display.configuration.refreshRate = configuration.refreshRate;
      }
      if (["portrait", "landscape"].includes(configuration.orientation)) {
        display.configuration.orientation = configuration.orientation;
      }
    }

    await display.save();

    // Log the action
    await loggingService.createLog({
      action: "update",
      entityType: "display",
      entityId: display._id,
      userId: req.user.userId,
      details: {
        description: `Display updated: ${display.displayName}`,
        changes: {
          displayName: displayName ? displayName : undefined,
          location: location ? location : undefined,
          status: status ? status : undefined,
        },
        metadata: {
          displayId: display.displayId,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Display ${id} updated by user ${req.user.userId}`);

    return res
      .status(200)
      .json(formatSuccessResponse(display, "Display updated successfully."));
  } catch (error) {
    console.error("❌ Update display error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Delete a display
 * Params: { id }
 * Returns: { message }
 * Auth: Required
 */
const deleteDisplay = async (req, res) => {
  try {
    const { id } = req.params;

    const display = await Display.findById(id);

    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    // If no owner, assign to current user for permission check
    if (!display.assignedAdmin) {
      display.assignedAdmin = req.user.userId;
      await display.save();
    }

    // Compare as strings
    const displayOwnerId = display.assignedAdmin.toString();
    const userId = req.user.userId.toString();

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to delete this display."
          )
        );
    }

    await Display.findByIdAndDelete(id);

    // Log the action
    await loggingService.createLog({
      action: "delete",
      entityType: "display",
      entityId: display._id,
      userId: req.user.userId,
      details: {
        description: `Display deleted: ${display.displayName}`,
        metadata: {
          displayId: display.displayId,
          displayName: display.displayName,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Display ${id} deleted by user ${req.user.userId}`);

    return res
      .status(200)
      .json(formatSuccessResponse(null, "Display deleted successfully."));
  } catch (error) {
    console.error("❌ Delete display error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Register a display device (browser-based display mode)
 * Body: { displayName, location, resolution (width, height), userAgent, browserInfo }
 * Returns: { displayId, connectionToken, message }
 * Auth: Not required (public endpoint for device registration)
 */
const registerDisplayDevice = async (req, res) => {
  try {
    const {
      displayName,
      location,
      resolution,
      browserInfo,
      displayId: customDisplayId,
      password,
    } = req.body;

    // Validation
    if (!displayName || !location) {
      return res
        .status(400)
        .json(formatErrorResponse("Display name and location are required."));
    }

    if (displayName.length < 2) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Display name must be at least 2 characters.")
        );
    }

    if (location.length < 2) {
      return res
        .status(400)
        .json(formatErrorResponse("Location must be at least 2 characters."));
    }

    // Password validation if provided
    let hashedPassword = null;
    if (password) {
      if (password.length < 4) {
        return res
          .status(400)
          .json(formatErrorResponse("Password must be at least 4 characters."));
      }
      if (password.length > 50) {
        return res
          .status(400)
          .json(formatErrorResponse("Password must not exceed 50 characters."));
      }
      // Hash the password
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Use custom displayId if provided and valid, otherwise generate one
    let displayId;
    if (customDisplayId && customDisplayId.trim()) {
      // Validate custom displayId
      if (customDisplayId.length < 3) {
        return res
          .status(400)
          .json(
            formatErrorResponse("Display ID must be at least 3 characters.")
          );
      }
      if (customDisplayId.length > 30) {
        return res
          .status(400)
          .json(
            formatErrorResponse("Display ID must not exceed 30 characters.")
          );
      }
      // Check if custom displayId already exists
      const existingDisplay = await Display.findOne({
        displayId: customDisplayId,
      });
      if (existingDisplay) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Display ID already exists. Choose a different one."
            )
          );
      }
      displayId = customDisplayId.trim();
    } else {
      // Generate unique displayId
      displayId = `DISP-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
    }

    // Generate connection token
    const connectionToken = uuidv4();

    // Create display record without assigned admin (null initially)
    // Device will wait for admin approval before being fully activated
    const newDisplay = new Display({
      displayId,
      displayName,
      location,
      status: "offline", // Offline until admin approves and activates
      assignedAdmin: null, // No admin until approval
      resolution: resolution || { width: 1920, height: 1080 },
      connectionToken,
      password: hashedPassword,
      isConnected: false,
      firmwareVersion: browserInfo?.browserVersion || "Web",
    });

    await newDisplay.save();

    // Create a connection request for the device
    // Use fully random UUID to ensure uniqueness
    const requestId = `REQ-${uuidv4()}`;
    const connectionRequest = new DisplayConnectionRequest({
      requestId,
      displayId: newDisplay._id,
      displayName,
      displayLocation: location,
      firmwareVersion: browserInfo?.browserVersion || "Web",
      status: "pending",
      requestedAt: new Date(),
    });

    try {
      await connectionRequest.save();
    } catch (connReqError) {
      console.error("❌ Connection request save error:", connReqError.message);
      console.error("Error code:", connReqError.code);
      console.error("Error keyPattern:", connReqError.keyPattern);

      // If connection request creation fails due to old index, try to update existing pending request
      if (
        connReqError.code === 11000 &&
        connReqError.message.includes("displayInfo")
      ) {
        console.log(
          "⚠️ Connection request creation failed (old index), attempting recovery..."
        );

        // Try to find and update an existing pending request for this display
        const existingRequest = await DisplayConnectionRequest.findOne({
          displayId: newDisplay._id,
          status: "pending",
        });

        if (!existingRequest) {
          throw connReqError; // Re-throw if no existing request to update
        }

        console.log(
          "✅ Reusing existing connection request:",
          existingRequest.requestId
        );
      } else {
        throw connReqError;
      }
    }

    console.log("✅ Display registered (pending approval):", displayId);

    return res.status(201).json(
      formatSuccessResponse(
        {
          displayId,
          connectionToken,
          displayName,
          location,
          status: "offline",
          isPendingApproval: true,
        },
        "Display registered successfully. Waiting for admin approval..."
      )
    );
  } catch (error) {
    console.error("❌ Display registration error:", error.message);
    console.error("Error code:", error.code);
    console.error("Error details:", error.keyPattern || error.keyValue);

    // Handle specific error cases with user-friendly messages
    let userMessage = "An error occurred while registering the display.";
    let statusCode = 500;

    // Handle duplicate key errors (E11000)
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      console.error("Duplicate field:", duplicateField);

      if (duplicateField === "connectionToken") {
        userMessage =
          "A system error occurred. Please try refreshing and registering again.";
      } else if (duplicateField === "displayId") {
        userMessage =
          "This display ID already exists. Please try registering again.";
      } else if (duplicateField === "requestId") {
        userMessage = "Please try registering again - a system error occurred.";
      } else {
        userMessage = `A registration error occurred (${duplicateField}). Please try again or contact support.`;
      }
      statusCode = 409; // Conflict
    }
    // Handle validation errors
    else if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(", ");
      userMessage = messages || "Please check your input and try again.";
      statusCode = 400;
    }

    return res.status(statusCode).json(formatErrorResponse(userMessage));
  }
};

/**
 * Get display by connection token (for display devices to fetch their config)
 * Query: { token }
 * Returns: { displayId, currentLoop, configuration, status }
 * Auth: Not required (uses connection token instead)
 */
const getDisplayByToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json(formatErrorResponse("Connection token is required."));
    }

    const display = await Display.findOne({ connectionToken: token });

    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    // Get the connection request for this display to check approval status
    const connectionRequest = await DisplayConnectionRequest.findOne({
      displayId: display._id,
    });

    console.log("✅ Display fetched by token:", display.displayId);

    return res.status(200).json(
      formatSuccessResponse({
        displayId: display.displayId,
        displayName: display.displayName,
        location: display.location,
        status: display.status,
        resolution: display.resolution,
        configuration: display.configuration,
        currentLoop: display.currentLoop,
        isConnected: display.isConnected,
        assignedAdmin: display.assignedAdmin, // Include to check if approved
        connectionRequestStatus: connectionRequest?.status || "pending",
        rejectionReason: connectionRequest?.rejectionReason || null,
      })
    );
  } catch (error) {
    console.error("❌ Get display by token error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Report display status (heartbeat from browser display)
 * Body: { connectionToken, status, currentAdPlaying, isPlaying }
 * Returns: { message }
 * Auth: Not required (uses connection token)
 */
const reportDisplayStatus = async (req, res) => {
  try {
    const { connectionToken, status, currentAdPlaying, isPlaying } = req.body;

    if (!connectionToken) {
      return res
        .status(400)
        .json(formatErrorResponse("Connection token is required."));
    }

    const display = await Display.findOne({ connectionToken: connectionToken });

    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    // Update display status
    display.status = status || "online";
    display.lastSeen = new Date();
    display.isConnected = true;

    await display.save();
    console.log("📡 Display status updated:", display.displayId, status);

    return res
      .status(200)
      .json(formatSuccessResponse(null, "Status reported successfully."));
  } catch (error) {
    console.error("❌ Report display status error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Login as a display device using displayId and connection token
 * Body: { displayId, connectionToken }
 * Returns: { displayId, connectionToken, displayName, location, accessToken }
 * Auth: Not required
 */
const loginDisplay = async (req, res) => {
  try {
    const { displayId, password } = req.body;

    if (!displayId || !password) {
      return res
        .status(400)
        .json(formatErrorResponse("Display ID and password are required."));
    }

    // Find display by displayId
    const display = await Display.findOne({ displayId });

    if (!display) {
      return res
        .status(404)
        .json(formatErrorResponse("Display not found. Invalid Display ID."));
    }

    // Check if display has a password set
    if (!display.password) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "This display does not have password authentication enabled. Please use your connection token instead."
          )
        );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, display.password);
    if (!isPasswordValid) {
      return res.status(401).json(formatErrorResponse("Invalid password."));
    }

    console.log("✅ Display login successful:", displayId);

    return res.status(200).json(
      formatSuccessResponse(
        {
          displayId: display.displayId,
          displayName: display.displayName,
          location: display.location,
          connectionToken: display.connectionToken,
          resolution: display.resolution,
          status: display.status,
        },
        "Display login successful."
      )
    );
  } catch (error) {
    console.error("❌ Display login error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Assign an admin to a pending display (approve connection request)
 * Params: { id } - display ID
 * Body: { }
 * Returns: { display, message }
 * Auth: Required (admin assigns themselves)
 */
const assignDisplayAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    // Find the display
    const display = await Display.findById(id);
    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    // Check if already assigned
    if (display.assignedAdmin && display.assignedAdmin !== null) {
      return res
        .status(400)
        .json(formatErrorResponse("Display is already assigned to an admin."));
    }

    // Assign the admin
    display.assignedAdmin = adminId;
    display.status = "offline"; // Change from pending_approval to offline
    display.isConnected = false;
    await display.save();

    // Update corresponding connection request
    await DisplayConnectionRequest.updateOne(
      { displayId: id },
      { status: "approved", respondedAt: new Date() }
    );

    // Log the action
    await loggingService.createLog({
      action: "approve",
      entityType: "display",
      entityId: display._id,
      userId: adminId,
      details: {
        description: `Display approved and assigned to admin: ${display.displayName}`,
        metadata: {
          displayId: display.displayId,
          displayName: display.displayName,
          location: display.location,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Display ${id} assigned to admin ${adminId}`);

    return res
      .status(200)
      .json(
        formatSuccessResponse(display, "Display approved and assigned to you.")
      );
  } catch (error) {
    console.error("❌ Assign display admin error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all connection requests for the current admin
 * Query: { page?, limit?, status? }
 * Returns: { requests[], pagination }
 * Auth: Required
 */
const getAllConnectionRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const adminId = req.user.userId;

    // Build filter
    const filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    // Get total count for pagination
    const total = await DisplayConnectionRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Fetch paginated results
    const requests = await DisplayConnectionRequest.find(filter)
      .populate("displayId", "displayId displayName location assignedAdmin")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log(`✅ Fetched ${requests.length} connection requests`);

    return res.status(200).json(
      formatSuccessResponse(
        {
          data: requests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: totalPages,
          },
        },
        "Connection requests fetched successfully"
      )
    );
  } catch (error) {
    console.error("❌ Get connection requests error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Approve a connection request and assign display to admin
 * Params: { requestId }
 * Returns: { display }
 * Auth: Required
 */
const approveConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user.userId;

    console.log(`🔍 Approving connection request: ${requestId}`);

    // Find the connection request
    const connectionRequest = await DisplayConnectionRequest.findById(
      requestId
    );
    if (!connectionRequest) {
      return res
        .status(404)
        .json(formatErrorResponse("Connection request not found"));
    }

    if (connectionRequest.status !== "pending") {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            `Cannot approve a ${connectionRequest.status} request`
          )
        );
    }

    // Update the request status
    connectionRequest.status = "approved";
    connectionRequest.respondedAt = new Date();
    connectionRequest.respondedBy = adminId;
    await connectionRequest.save();

    console.log(
      `✅ Connection request status updated. Display ID: ${connectionRequest.displayId}`
    );

    // Update the display and assign to admin
    const display = await Display.findByIdAndUpdate(
      connectionRequest.displayId,
      {
        assignedAdmin: adminId,
        status: "offline",
      },
      { new: true }
    );

    if (!display) {
      console.error(
        "❌ Display not found for ID:",
        connectionRequest.displayId
      );
      return res
        .status(404)
        .json(formatErrorResponse("Associated display not found"));
    }

    console.log(`✅ Display updated: ${display.displayId}`);

    // Log the action
    await loggingService.createLog({
      action: "status_change",
      entityType: "display",
      entityId: display._id,
      userId: adminId,
      details: {
        description: `Display approved and assigned to admin: ${display.displayName}`,
        changes: {
          assignedAdmin: { from: null, to: adminId },
          status: { from: "unassigned", to: "offline" },
        },
        displayId: display.displayId,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Connection request ${requestId} approved`);

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          connectionRequest,
          "Connection request approved successfully"
        )
      );
  } catch (error) {
    console.error("❌ Approve connection request error:", error.message);
    console.error("Stack trace:", error.stack);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Reject a connection request
 * Params: { requestId }
 * Body: { rejectionReason? }
 * Returns: { connectionRequest }
 * Auth: Required
 */
const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.userId;

    // Find the connection request
    const connectionRequest = await DisplayConnectionRequest.findById(
      requestId
    );
    if (!connectionRequest) {
      return res
        .status(404)
        .json(formatErrorResponse("Connection request not found"));
    }

    if (connectionRequest.status !== "pending") {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            `Cannot reject a ${connectionRequest.status} request`
          )
        );
    }

    // Update the request status
    connectionRequest.status = "rejected";
    connectionRequest.respondedAt = new Date();
    connectionRequest.respondedBy = adminId;
    if (rejectionReason) {
      connectionRequest.rejectionReason = rejectionReason;
    }
    await connectionRequest.save();

    // Log the action
    await loggingService.createLog({
      action: "status_change",
      entityType: "display",
      entityId: connectionRequest.displayId,
      userId: adminId,
      details: {
        description: `Display rejected${
          rejectionReason ? ": " + rejectionReason : ""
        }`,
        changes: {
          status: { from: "pending_approval", to: "rejected" },
        },
        rejectionReason,
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Connection request ${requestId} rejected`);

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          connectionRequest,
          "Connection request rejected successfully"
        )
      );
  } catch (error) {
    console.error("❌ Reject connection request error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

export {
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
};
