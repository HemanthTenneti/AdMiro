const Display = require("../models/Display");
const { v4: uuidv4 } = require("uuid");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/helpers");

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

    // Don't populate - just get the raw display with assignedAdmin as ObjectId
    const display = await Display.findById(id);

    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    // Check if user has access to this display
    // assignedAdmin is stored as ObjectId, so compare directly
    const displayOwnerId =
      display.assignedAdmin?.toString() || display.assignedAdmin;
    const userId = req.user.userId?.toString?.() || req.user.userId;

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

    // Compare as strings since both should be ObjectId strings
    const displayOwnerId =
      display.assignedAdmin?.toString?.() || display.assignedAdmin?.toString();
    const userId = req.user.userId?.toString?.() || req.user.userId;

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

    // Compare as strings since both should be ObjectId strings
    const displayOwnerId =
      display.assignedAdmin?.toString?.() || display.assignedAdmin?.toString();
    const userId = req.user.userId?.toString?.() || req.user.userId;

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
    const { displayName, location, resolution, browserInfo } = req.body;

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

    // Generate unique displayId
    let displayId = `DISP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Generate connection token
    const connectionToken = uuidv4();

    // Create display record
    const newDisplay = new Display({
      displayId,
      displayName,
      location,
      status: "offline",
      assignedAdmin: req.user.userId, // Assign logged-in user as admin
      resolution: resolution || { width: 1920, height: 1080 },
      connectionToken,
      isConnected: true,
      firmwareVersion: browserInfo?.browserVersion || "Web",
    });

    await newDisplay.save();
    console.log("✅ Display registered:", displayId);

    return res.status(201).json(
      formatSuccessResponse(
        {
          displayId,
          connectionToken,
          displayName,
          location,
        },
        "Display registered successfully. Device ready to display advertisements."
      )
    );
  } catch (error) {
    console.error("❌ Display registration error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
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
    const { token } = req.query;

    if (!token) {
      return res
        .status(400)
        .json(formatErrorResponse("Connection token is required."));
    }

    const display = await Display.findOne({ connectionToken: token });

    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

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
      })
    );
  } catch (error) {
    console.error("❌ Get display by token error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Report display status (heartbeat from browser display)
 * Body: { token, status, currentAdPlaying, isPlaying }
 * Returns: { message }
 * Auth: Not required (uses connection token)
 */
const reportDisplayStatus = async (req, res) => {
  try {
    const { token, status, currentAdPlaying, isPlaying } = req.body;

    if (!token) {
      return res
        .status(400)
        .json(formatErrorResponse("Connection token is required."));
    }

    const display = await Display.findOne({ connectionToken: token });

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
    const { displayId, connectionToken } = req.body;

    if (!displayId || !connectionToken) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Display ID and connection token are required.")
        );
    }

    // Find display by displayId and connectionToken
    const display = await Display.findOne({
      displayId,
      connectionToken,
    });

    if (!display) {
      return res
        .status(404)
        .json(
          formatErrorResponse(
            "Display not found. Invalid displayId or connection token."
          )
        );
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

module.exports = {
  createDisplay,
  getDisplays,
  getDisplayById,
  updateDisplay,
  deleteDisplay,
  registerDisplayDevice,
  getDisplayByToken,
  reportDisplayStatus,
  loginDisplay,
};
