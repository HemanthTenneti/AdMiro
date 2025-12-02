import Advertisement from "../models/Advertisement.js";
import { v4 as uuidv4 } from "uuid";
import {
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/helpers.js";
import * as loggingService from "../services/loggingService.js";

/**
 * Create a new advertisement
 * Body: { adName, description, mediaType, duration, mediaUrl?, isLink? }
 * File: Single file upload (image or video) - optional if using link
 * Returns: { advertisement, message }
 * Auth: Required
 */
const createAdvertisement = async (req, res) => {
  try {
    const { adName, description, mediaType, duration, mediaUrl, isLink } =
      req.body;

    // Validation
    if (!adName || !mediaType || !duration) {
      return res
        .status(400)
        .json(
          formatErrorResponse("Ad name, media type, and duration are required.")
        );
    }

    // Check if either file or link is provided
    if (!req.file && !mediaUrl) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Either a media file or a valid media URL is required."
          )
        );
    }

    if (adName.length < 3) {
      return res
        .status(400)
        .json(formatErrorResponse("Ad name must be at least 3 characters."));
    }

    if (!["image", "video"].includes(mediaType)) {
      return res
        .status(400)
        .json(formatErrorResponse("Media type must be 'image' or 'video'."));
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 300) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Duration must be a number between 1 and 300 seconds."
          )
        );
    }

    let finalMediaUrl;
    let fileSize = 0;

    // Handle file upload vs link
    if (req.file) {
      // File upload path - convert buffer to base64 data URL
      // Validate file size (100MB limit)
      const maxFileSize = 100 * 1024 * 1024;
      if (req.file.size > maxFileSize) {
        return res
          .status(400)
          .json(formatErrorResponse("File size must not exceed 100MB."));
      }

      // Validate file type matches mediaType
      const isImage = req.file.mimetype.startsWith("image/");
      const isVideo = req.file.mimetype.startsWith("video/");

      if (mediaType === "image" && !isImage) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Media type is 'image' but file is not an image."
            )
          );
      }

      if (mediaType === "video" && !isVideo) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Media type is 'video' but file is not a video."
            )
          );
      }

      // Convert buffer to base64 data URL
      const base64Data = req.file.buffer.toString("base64");
      finalMediaUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      fileSize = req.file.size;

      console.log(
        `✅ File uploaded and encoded: ${req.file.originalname} (${fileSize} bytes)`
      );
    } else {
      // Link path - validate URL
      if (!mediaUrl || typeof mediaUrl !== "string") {
        return res
          .status(400)
          .json(formatErrorResponse("Media URL must be a valid string."));
      }

      // Basic URL validation
      try {
        new URL(mediaUrl);
      } catch (err) {
        return res
          .status(400)
          .json(formatErrorResponse("Media URL must be a valid URL."));
      }

      finalMediaUrl = mediaUrl.trim();
    }

    // All new ads are created as active
    const adId = `AD-${uuidv4().split("-")[0].toUpperCase()}`;

    // Create advertisement
    const newAdvertisement = new Advertisement({
      adId,
      adName: adName.trim(),
      description: description?.trim() || "",
      mediaUrl: finalMediaUrl,
      mediaType,
      duration: durationNum,
      thumbnailUrl: mediaType === "image" ? finalMediaUrl : null, // Images serve as their own thumbnail
      status: "active",
      advertiser: req.user.userId,
      fileSize,
    });

    await newAdvertisement.save();

    // Log the action
    await loggingService.createLog({
      action: "create",
      entityType: "advertisement",
      entityId: newAdvertisement._id,
      userId: req.user.userId,
      details: {
        description: `Advertisement created: ${adName}`,
        metadata: {
          adId,
          adName,
          mediaType,
          duration: durationNum,
          fileSize,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Advertisement created: ${adId} by user ${req.user.userId}`);

    return res
      .status(201)
      .json(
        formatSuccessResponse(
          newAdvertisement,
          "Advertisement created successfully."
        )
      );
  } catch (error) {
    console.error("❌ Create advertisement error:", error.message);
    return res.status(400).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all advertisements for the current user
 * Query: { page?, limit?, status?, sortBy?, order? }
 * Returns: { advertisements, pagination, message }
 * Auth: Required
 */
const getAdvertisements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { advertiser: req.user.userId };
    if (
      status &&
      ["active", "scheduled", "paused", "expired", "draft"].includes(status)
    ) {
      filter.status = status;
    }

    // Add search filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { adName: searchRegex },
        { description: searchRegex },
        { mediaType: searchRegex },
        { status: searchRegex },
        { adId: searchRegex },
      ];
    }

    // Build sort
    const sortObj = {};
    const validSortFields = [
      "createdAt",
      "adName",
      "status",
      "duration",
      "views",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    sortObj[sortField] = order === "asc" ? 1 : -1;

    console.log(
      `🔍 Fetching advertisements for user ${req.user.userId} with filter:`,
      filter
    );

    const advertisements = await Advertisement.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sortObj);

    const total = await Advertisement.countDocuments(filter);

    console.log(
      `✅ Fetched ${advertisements.length} advertisements for user ${req.user.userId}`
    );

    return res.status(200).json(
      formatSuccessResponse(
        {
          advertisements,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            pageSize: parseInt(limit),
            total,
          },
        },
        "Advertisements fetched successfully."
      )
    );
  } catch (error) {
    console.error("❌ Get advertisements error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get a single advertisement by ID
 * Params: { id }
 * Returns: { advertisement, message }
 * Auth: Required
 */
const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res
        .status(404)
        .json(formatErrorResponse("Advertisement not found."));
    }

    // Check if user owns this advertisement
    const advertiserId =
      advertisement.advertiser?.toString() || advertisement.advertiser;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (advertiserId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to view this advertisement."
          )
        );
    }

    console.log(`✅ Fetched advertisement ${id} for user ${req.user.userId}`);

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          advertisement,
          "Advertisement fetched successfully."
        )
      );
  } catch (error) {
    console.error("❌ Get advertisement error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Update an advertisement
 * Params: { id }
 * Body: { adName?, description?, duration?, scheduledStart?, scheduledEnd?, status?, thumbnailUrl? }
 * Returns: { advertisement, message }
 * Auth: Required
 */
const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      adName,
      description,
      duration,
      scheduledStart,
      scheduledEnd,
      status,
      thumbnailUrl,
    } = req.body;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res
        .status(404)
        .json(formatErrorResponse("Advertisement not found."));
    }

    // Check ownership
    const advertiserId =
      advertisement.advertiser?.toString() || advertisement.advertiser;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (advertiserId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to update this advertisement."
          )
        );
    }

    // Update fields
    if (adName) {
      if (adName.length < 3) {
        return res
          .status(400)
          .json(formatErrorResponse("Ad name must be at least 3 characters."));
      }
      advertisement.adName = adName.trim();
    }

    if (description !== undefined) {
      advertisement.description = description?.trim() || "";
    }

    if (duration) {
      const durationNum = parseInt(duration);
      if (isNaN(durationNum) || durationNum < 1 || durationNum > 300) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Duration must be a number between 1 and 300 seconds."
            )
          );
      }
      advertisement.duration = durationNum;
    }

    if (scheduledStart || scheduledEnd) {
      if (scheduledStart) {
        const startTime = new Date(scheduledStart);
        if (isNaN(startTime.getTime())) {
          return res
            .status(400)
            .json(formatErrorResponse("Invalid scheduled start time format."));
        }
        advertisement.scheduledStart = startTime;
      }

      if (scheduledEnd) {
        const endTime = new Date(scheduledEnd);
        if (isNaN(endTime.getTime())) {
          return res
            .status(400)
            .json(formatErrorResponse("Invalid scheduled end time format."));
        }
        advertisement.scheduledEnd = endTime;
      }

      if (
        advertisement.scheduledStart &&
        advertisement.scheduledEnd &&
        advertisement.scheduledStart >= advertisement.scheduledEnd
      ) {
        return res
          .status(400)
          .json(formatErrorResponse("Start time must be before end time."));
      }
    }

    if (
      status &&
      ["active", "scheduled", "paused", "expired", "draft"].includes(status)
    ) {
      advertisement.status = status;
    }

    if (thumbnailUrl !== undefined) {
      advertisement.thumbnailUrl = thumbnailUrl || null;
    }

    await advertisement.save();

    // Log the action
    await loggingService.createLog({
      action: "update",
      entityType: "advertisement",
      entityId: advertisement._id,
      userId: req.user.userId,
      details: {
        description: `Advertisement updated: ${advertisement.adName}`,
        changes: {
          adName,
          description,
          duration,
          status,
        },
        metadata: {
          adId: advertisement.adId,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Advertisement ${id} updated by user ${req.user.userId}`);

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          advertisement,
          "Advertisement updated successfully."
        )
      );
  } catch (error) {
    console.error("❌ Update advertisement error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Delete an advertisement
 * Params: { id }
 * Returns: { message }
 * Auth: Required
 */
const deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res
        .status(404)
        .json(formatErrorResponse("Advertisement not found."));
    }

    // Check ownership
    const advertiserId =
      advertisement.advertiser?.toString() || advertisement.advertiser;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (advertiserId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to delete this advertisement."
          )
        );
    }

    await Advertisement.findByIdAndDelete(id);

    // Log the action
    await loggingService.createLog({
      action: "delete",
      entityType: "advertisement",
      entityId: advertisement._id,
      userId: req.user.userId,
      details: {
        description: `Advertisement deleted: ${advertisement.adName}`,
        metadata: {
          adId: advertisement.adId,
          adName: advertisement.adName,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Advertisement ${id} deleted by user ${req.user.userId}`);

    return res
      .status(200)
      .json(formatSuccessResponse(null, "Advertisement deleted successfully."));
  } catch (error) {
    console.error("❌ Delete advertisement error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Update advertisement status
 * Params: { id }
 * Body: { status }
 * Returns: { advertisement, message }
 * Auth: Required
 */
const updateAdvertisementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["active", "scheduled", "paused", "expired", "draft"].includes(status)
    ) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Status must be one of: active, scheduled, paused, expired, draft"
          )
        );
    }

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res
        .status(404)
        .json(formatErrorResponse("Advertisement not found."));
    }

    // Check ownership
    const advertiserId =
      advertisement.advertiser?.toString() || advertisement.advertiser;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (advertiserId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to update this advertisement."
          )
        );
    }

    advertisement.status = status;
    await advertisement.save();

    // Log the action
    await loggingService.createLog({
      action: "status_change",
      entityType: "advertisement",
      entityId: advertisement._id,
      userId: req.user.userId,
      details: {
        description: `Advertisement status changed to: ${status}`,
        changes: {
          status,
        },
        metadata: {
          adId: advertisement.adId,
          adName: advertisement.adName,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(
      `✅ Advertisement ${id} status updated to ${status} by user ${req.user.userId}`
    );

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          advertisement,
          "Advertisement status updated successfully."
        )
      );
  } catch (error) {
    console.error("❌ Update advertisement status error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all active advertisements (public endpoint for displays)
 * Query: { page?, limit? }
 * Returns: { advertisements, pagination, message }
 * Auth: Not required (public endpoint for displays)
 */
const getPublicAdvertisements = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Only fetch active advertisements
    const filter = { status: "active" };

    console.log("🔍 Fetching public advertisements (active only)");

    const advertisements = await Advertisement.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Advertisement.countDocuments(filter);

    console.log(`✅ Fetched ${advertisements.length} public advertisements`);

    return res.status(200).json(
      formatSuccessResponse(
        {
          advertisements,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            pageSize: parseInt(limit),
            total,
          },
        },
        "Public advertisements fetched successfully."
      )
    );
  } catch (error) {
    console.error("❌ Get public advertisements error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

export {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus,
  getPublicAdvertisements,
};
