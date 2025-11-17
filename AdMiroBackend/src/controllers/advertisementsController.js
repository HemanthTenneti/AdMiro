const Advertisement = require("../models/Advertisement");
const { v4: uuidv4 } = require("uuid");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/helpers");

/**
 * Create a new advertisement
 * Body: { adName, description, mediaUrl, mediaType, duration, scheduledStart, scheduledEnd, thumbnailUrl? }
 * Returns: { advertisement, message }
 * Auth: Required
 */
const createAdvertisement = async (req, res) => {
  try {
    const {
      adName,
      description,
      mediaUrl,
      mediaType,
      duration,
      scheduledStart,
      scheduledEnd,
      thumbnailUrl,
    } = req.body;

    // Validation
    if (!adName || !mediaUrl || !mediaType || !duration) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Ad name, media URL, media type, and duration are required."
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

    // Validate scheduled dates if provided
    let status = "draft";
    let startTime = null;
    let endTime = null;

    if (scheduledStart || scheduledEnd) {
      if (!scheduledStart || !scheduledEnd) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Both scheduled start and end times are required if scheduling."
            )
          );
      }

      startTime = new Date(scheduledStart);
      endTime = new Date(scheduledEnd);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res
          .status(400)
          .json(
            formatErrorResponse("Invalid date format for scheduled times.")
          );
      }

      if (startTime >= endTime) {
        return res
          .status(400)
          .json(formatErrorResponse("Start time must be before end time."));
      }

      status = "scheduled";
    }

    // Generate unique ad ID
    const adId = `AD-${uuidv4().split("-")[0].toUpperCase()}`;

    // Create advertisement
    const newAdvertisement = new Advertisement({
      adId,
      adName: adName.trim(),
      description: description?.trim() || "",
      mediaUrl,
      mediaType,
      duration: durationNum,
      thumbnailUrl: thumbnailUrl || null,
      scheduledStart: startTime,
      scheduledEnd: endTime,
      status,
      advertiser: req.user.userId,
    });

    await newAdvertisement.save();

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

module.exports = {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  updateAdvertisementStatus,
};
