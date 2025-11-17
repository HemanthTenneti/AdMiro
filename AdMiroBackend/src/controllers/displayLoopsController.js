import DisplayLoop from "../models/DisplayLoop.js";
import Display from "../models/Display.js";
import Advertisement from "../models/Advertisement.js";
import { v4 as uuidv4 } from "uuid";
import {
  formatSuccessResponse,
  formatErrorResponse,
} from "../utils/helpers.js";
import * as loggingService from "../services/loggingService.js";

/**
 * Create a new display loop
 * Body: { displayId, loopName, description?, advertisements: [{ adId, loopOrder }], rotationType? }
 * Returns: { loop, message }
 * Auth: Required
 */
const createDisplayLoop = async (req, res) => {
  try {
    const { displayId, loopName, description, advertisements, rotationType } =
      req.body;

    // Validation
    if (
      !displayId ||
      !loopName ||
      !advertisements ||
      advertisements.length === 0
    ) {
      return res
        .status(400)
        .json(
          formatErrorResponse(
            "Display ID, loop name, and at least one advertisement are required."
          )
        );
    }

    if (loopName.length < 3) {
      return res
        .status(400)
        .json(formatErrorResponse("Loop name must be at least 3 characters."));
    }

    // Check display exists and user owns it
    const display = await Display.findById(displayId);
    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    const displayOwnerId =
      display.assignedAdmin?.toString() || display.assignedAdmin;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to create a loop for this display."
          )
        );
    }

    // Validate and fetch all advertisements
    let totalDuration = 0;
    const validatedAds = [];

    for (const adItem of advertisements) {
      if (!adItem.adId || adItem.loopOrder === undefined) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Each advertisement must have adId and loopOrder."
            )
          );
      }

      const ad = await Advertisement.findById(adItem.adId);
      if (!ad) {
        return res
          .status(404)
          .json(formatErrorResponse(`Advertisement ${adItem.adId} not found.`));
      }

      validatedAds.push({
        adId: adItem.adId,
        loopOrder: parseInt(adItem.loopOrder),
      });

      totalDuration += ad.duration || 0;
    }

    // Sort by loopOrder
    validatedAds.sort((a, b) => a.loopOrder - b.loopOrder);

    // Generate loop ID
    const loopId = `LOOP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create loop
    const newLoop = new DisplayLoop({
      loopId,
      displayId,
      loopName: loopName.trim(),
      description: description?.trim() || "",
      advertisements: validatedAds,
      rotationType: rotationType || "sequential",
      totalDuration,
    });

    await newLoop.save();

    // Populate references
    await newLoop.populate("displayId advertisements.adId");

    // Log the action
    await loggingService.createLog({
      action: "create",
      entityType: "loop",
      entityId: newLoop._id,
      userId: req.user.userId,
      details: {
        description: `Display loop created: ${loopName}`,
        metadata: {
          loopId,
          loopName,
          displayId,
          advertisementCount: validatedAds.length,
          totalDuration,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Display loop created: ${loopId} for display ${displayId}`);

    return res
      .status(201)
      .json(
        formatSuccessResponse(newLoop, "Display loop created successfully.")
      );
  } catch (error) {
    console.error("❌ Create display loop error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get all display loops for a display
 * Params: { displayId }
 * Query: { page?, limit? }
 * Returns: { loops, pagination, message }
 * Auth: Required (must be display owner)
 */
const getLoopsByDisplay = async (req, res) => {
  try {
    const { displayId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check display exists and user owns it
    const display = await Display.findById(displayId);
    if (!display) {
      return res.status(404).json(formatErrorResponse("Display not found."));
    }

    const displayOwnerId =
      display.assignedAdmin?.toString() || display.assignedAdmin;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to view loops for this display."
          )
        );
    }

    const loops = await DisplayLoop.find({ displayId })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("advertisements.adId", "adName mediaType duration mediaUrl")
      .sort({ createdAt: -1 });

    const total = await DisplayLoop.countDocuments({ displayId });

    console.log(`✅ Fetched ${loops.length} loops for display ${displayId}`);

    return res.status(200).json(
      formatSuccessResponse(
        {
          loops,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            pageSize: parseInt(limit),
            total,
          },
        },
        "Display loops fetched successfully."
      )
    );
  } catch (error) {
    console.error("❌ Get loops by display error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Get a single display loop by ID
 * Params: { id }
 * Returns: { loop, message }
 * Auth: Required
 */
const getLoopById = async (req, res) => {
  try {
    const { id } = req.params;

    const loop = await DisplayLoop.findById(id).populate(
      "displayId advertisements.adId"
    );

    if (!loop) {
      return res.status(404).json(formatErrorResponse("Loop not found."));
    }

    // Check permissions
    const display = await Display.findById(loop.displayId);
    const displayOwnerId =
      display.assignedAdmin?.toString() || display.assignedAdmin;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse("You do not have permission to view this loop.")
        );
    }

    console.log(`✅ Fetched loop ${id}`);

    return res
      .status(200)
      .json(formatSuccessResponse(loop, "Loop fetched successfully."));
  } catch (error) {
    console.error("❌ Get loop error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Update a display loop (reorder ads, change rotation type, etc)
 * Params: { id }
 * Body: { loopName?, description?, advertisements?, rotationType? }
 * Returns: { loop, message }
 * Auth: Required
 */
const updateDisplayLoop = async (req, res) => {
  try {
    const { id } = req.params;
    const { loopName, description, advertisements, rotationType } = req.body;

    const loop = await DisplayLoop.findById(id);
    if (!loop) {
      return res.status(404).json(formatErrorResponse("Loop not found."));
    }

    // Check permissions
    const display = await Display.findById(loop.displayId);
    const displayOwnerId =
      display.assignedAdmin?.toString() || display.assignedAdmin;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse("You do not have permission to update this loop.")
        );
    }

    // Update fields
    if (loopName) {
      loop.loopName = loopName.trim();
    }
    if (description !== undefined) {
      loop.description = description.trim();
    }
    if (
      rotationType &&
      ["sequential", "random", "scheduled"].includes(rotationType)
    ) {
      loop.rotationType = rotationType;
    }

    // Update advertisements if provided
    if (advertisements && advertisements.length > 0) {
      let totalDuration = 0;
      const validatedAds = [];

      for (const adItem of advertisements) {
        if (!adItem.adId || adItem.loopOrder === undefined) {
          return res
            .status(400)
            .json(
              formatErrorResponse(
                "Each advertisement must have adId and loopOrder."
              )
            );
        }

        const ad = await Advertisement.findById(adItem.adId);
        if (!ad) {
          return res
            .status(404)
            .json(
              formatErrorResponse(`Advertisement ${adItem.adId} not found.`)
            );
        }

        validatedAds.push({
          adId: adItem.adId,
          loopOrder: parseInt(adItem.loopOrder),
        });

        totalDuration += ad.duration || 0;
      }

      // Sort by loopOrder
      validatedAds.sort((a, b) => a.loopOrder - b.loopOrder);

      loop.advertisements = validatedAds;
      loop.totalDuration = totalDuration;
    }

    await loop.save();
    await loop.populate("displayId advertisements.adId");

    // Log the action
    await loggingService.createLog({
      action: "update",
      entityType: "loop",
      entityId: loop._id,
      userId: req.user.userId,
      details: {
        description: `Display loop updated: ${loop.loopName}`,
        changes: {
          loopName,
          description,
          rotationType,
          advertisementCount: advertisements?.length,
        },
        metadata: {
          loopId: loop.loopId,
          displayId: loop.displayId,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Loop ${id} updated`);

    return res
      .status(200)
      .json(formatSuccessResponse(loop, "Loop updated successfully."));
  } catch (error) {
    console.error("❌ Update loop error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Delete a display loop
 * Params: { id }
 * Returns: { message }
 * Auth: Required
 */
const deleteDisplayLoop = async (req, res) => {
  try {
    const { id } = req.params;

    const loop = await DisplayLoop.findById(id);
    if (!loop) {
      return res.status(404).json(formatErrorResponse("Loop not found."));
    }

    // Check permissions
    const display = await Display.findById(loop.displayId);
    const displayOwnerId =
      display.assignedAdmin?.toString() || display.assignedAdmin;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse("You do not have permission to delete this loop.")
        );
    }

    await DisplayLoop.findByIdAndDelete(id);

    // Log the action
    await loggingService.createLog({
      action: "delete",
      entityType: "loop",
      entityId: loop._id,
      userId: req.user.userId,
      details: {
        description: `Display loop deleted: ${loop.loopName}`,
        metadata: {
          loopId: loop.loopId,
          loopName: loop.loopName,
          displayId: loop.displayId,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    console.log(`✅ Loop ${id} deleted`);

    return res
      .status(200)
      .json(formatSuccessResponse(null, "Loop deleted successfully."));
  } catch (error) {
    console.error("❌ Delete loop error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

/**
 * Reorder advertisements in a loop
 * Params: { id }
 * Body: { advertisements: [{ adId, loopOrder }] }
 * Returns: { loop, message }
 * Auth: Required
 */
const reorderLoopAdvertisements = async (req, res) => {
  try {
    const { id } = req.params;
    const { advertisements } = req.body;

    if (!advertisements || advertisements.length === 0) {
      return res
        .status(400)
        .json(formatErrorResponse("Advertisements array is required."));
    }

    const loop = await DisplayLoop.findById(id);
    if (!loop) {
      return res.status(404).json(formatErrorResponse("Loop not found."));
    }

    // Check permissions
    const display = await Display.findById(loop.displayId);
    const displayOwnerId =
      display.assignedAdmin?.toString() || display.assignedAdmin;
    const userId = req.user.userId?.toString?.() || req.user.userId;

    if (displayOwnerId !== userId) {
      return res
        .status(403)
        .json(
          formatErrorResponse(
            "You do not have permission to reorder ads in this loop."
          )
        );
    }

    // Validate and fetch advertisements
    let totalDuration = 0;
    const validatedAds = [];

    for (const adItem of advertisements) {
      if (!adItem.adId || adItem.loopOrder === undefined) {
        return res
          .status(400)
          .json(
            formatErrorResponse(
              "Each advertisement must have adId and loopOrder."
            )
          );
      }

      const ad = await Advertisement.findById(adItem.adId);
      if (!ad) {
        return res
          .status(404)
          .json(formatErrorResponse(`Advertisement ${adItem.adId} not found.`));
      }

      validatedAds.push({
        adId: adItem.adId,
        loopOrder: parseInt(adItem.loopOrder),
      });

      totalDuration += ad.duration || 0;
    }

    // Sort by loopOrder
    validatedAds.sort((a, b) => a.loopOrder - b.loopOrder);

    loop.advertisements = validatedAds;
    loop.totalDuration = totalDuration;
    await loop.save();
    await loop.populate("displayId advertisements.adId");

    console.log(`✅ Loop ${id} advertisements reordered`);

    return res
      .status(200)
      .json(
        formatSuccessResponse(loop, "Advertisements reordered successfully.")
      );
  } catch (error) {
    console.error("❌ Reorder advertisements error:", error.message);
    return res.status(500).json(formatErrorResponse(error.message));
  }
};

export {
  createDisplayLoop,
  getLoopsByDisplay,
  getLoopById,
  updateDisplayLoop,
  deleteDisplayLoop,
  reorderLoopAdvertisements,
};
