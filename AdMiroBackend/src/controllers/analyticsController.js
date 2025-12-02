import Display from "../models/Display.js";
import Analytics from "../models/Analytics.js";
import Advertisement from "../models/Advertisement.js";
import DisplayLoop from "../models/DisplayLoop.js";

// Get display uptime and status
export const getDisplayMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { displayId } = req.params;

    // Get display
    const display = await Display.findById(displayId);

    if (!display || display.assignedAdmin.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Display not found",
      });
    }

    // Calculate uptime (based on lastSeen and status)
    const now = new Date();
    const lastSeen = display.lastSeen || display.createdAt;
    const totalTime = now - new Date(display.createdAt);
    const offlineTime = display.status === "online" ? 0 : now - lastSeen;
    const uptimePercentage = Math.max(
      0,
      ((totalTime - offlineTime) / totalTime) * 100
    );

    res.status(200).json({
      success: true,
      data: {
        displayId: display._id,
        displayName: display.displayName,
        status: display.status,
        isConnected: display.isConnected,
        lastSeen: display.lastSeen,
        uptimePercentage: Math.round(uptimePercentage * 100) / 100,
        resolution: display.resolution,
        location: display.location,
      },
    });
  } catch (error) {
    console.error("Error getting display metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get display metrics",
    });
  }
};

// Get advertisement playback metrics
export const getAdMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { adId } = req.params;

    // Get advertisement
    const ad = await Advertisement.findById(adId);

    if (!ad || ad.advertiser.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found",
      });
    }

    // Get analytics for this ad across all displays
    const analytics = await Analytics.find({ adId }).populate("displayId");

    // Calculate metrics
    const totalImpressions = analytics.reduce(
      (sum, a) => sum + a.impressions,
      0
    );
    const totalViews = analytics.reduce(
      (sum, a) => sum + a.completedViews + a.partialViews,
      0
    );
    const totalEngagement = analytics.reduce(
      (sum, a) =>
        sum + a.engagementMetrics.clicks + a.engagementMetrics.interactions,
      0
    );
    const totalViewDuration = analytics.reduce(
      (sum, a) => sum + a.viewDuration,
      0
    );

    // Get displays using this ad
    const displaysUsingAd = await DisplayLoop.find({ advertisements: adId })
      .populate("displayId")
      .select("displayId")
      .distinct("displayId");

    res.status(200).json({
      success: true,
      data: {
        adId: ad._id,
        adName: ad.adName,
        mediaType: ad.mediaType,
        duration: ad.duration,
        status: ad.status,
        totalImpressions,
        totalViews,
        totalEngagement,
        totalViewDuration,
        displaysCount: displaysUsingAd.length,
        analyticsBreakdown: analytics.map(a => ({
          displayId: a.displayId._id,
          displayName: a.displayId.displayName,
          impressions: a.impressions,
          completedViews: a.completedViews,
          partialViews: a.partialViews,
          viewDuration: a.viewDuration,
          clicks: a.engagementMetrics.clicks,
          interactions: a.engagementMetrics.interactions,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting ad metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get ad metrics",
    });
  }
};

// Get all displays status summary for user
export const getDisplaysStatusSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all displays for this user
    const displays = await Display.find({ assignedAdmin: userId });

    // Function to determine status based on lastSeen
    const getActualStatus = display => {
      if (!display.lastSeen) {
        return display.status;
      }

      const now = new Date();
      const lastSeen = new Date(display.lastSeen);
      const hoursSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60);

      console.log(
        `Display: ${
          display.displayName
        }, Last Seen: ${lastSeen}, Hours Since: ${hoursSinceLastSeen.toFixed(
          2
        )}, Original Status: ${display.status}`
      );

      // If last seen is > 2 hours ago, status should be offline
      if (hoursSinceLastSeen > 2) {
        console.log(
          `  -> Setting to OFFLINE (${hoursSinceLastSeen.toFixed(
            2
          )} hours > 2 hours)`
        );
        return "offline";
      }

      console.log(`  -> Keeping original status: ${display.status}`);
      return display.status;
    };

    // Update status counts based on actual status (including 2-hour rule)
    const displaysWithActualStatus = displays.map(d => ({
      ...d.toObject(),
      actualStatus: getActualStatus(d),
    }));

    const onlineCount = displaysWithActualStatus.filter(
      d => d.actualStatus === "online"
    ).length;
    const offlineCount = displaysWithActualStatus.filter(
      d => d.actualStatus === "offline"
    ).length;
    const inactiveCount = displaysWithActualStatus.filter(
      d => d.actualStatus === "inactive"
    ).length;

    const displaysSummary = displaysWithActualStatus.map(d => ({
      _id: d._id,
      displayName: d.displayName,
      location: d.location,
      status: d.actualStatus, // Use actual status with 2-hour rule
      isConnected: d.isConnected,
      lastSeen: d.lastSeen,
      resolution: `${d.resolution.width}x${d.resolution.height}`,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalDisplays: displays.length,
        onlineCount,
        offlineCount,
        inactiveCount,
        displays: displaysSummary,
      },
    });
  } catch (error) {
    console.error("Error getting displays status summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get displays status summary",
    });
  }
};

// Get all ads metrics summary for user
export const getAdsMetricsSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all ads for this user
    const ads = await Advertisement.find({ advertiser: userId });

    if (ads.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalAds: 0,
          activeAds: 0,
          pausedAds: 0,
          expiredAds: 0,
          totalImpressions: 0,
          totalViews: 0,
          ads: [],
        },
      });
    }

    const adIds = ads.map(a => a._id);

    // Get analytics for all ads
    const allAnalytics = await Analytics.find({ adId: { $in: adIds } });

    const totalImpressions = allAnalytics.reduce(
      (sum, a) => sum + a.impressions,
      0
    );
    const totalViews = allAnalytics.reduce(
      (sum, a) => sum + a.completedViews + a.partialViews,
      0
    );

    const activeAds = ads.filter(a => a.status === "active").length;
    const pausedAds = ads.filter(a => a.status === "paused").length;
    const expiredAds = ads.filter(a => a.status === "expired").length;

    const adsSummary = ads.map(ad => {
      const adAnalytics = allAnalytics.filter(
        a => a.adId.toString() === ad._id.toString()
      );
      const adImpressions = adAnalytics.reduce(
        (sum, a) => sum + a.impressions,
        0
      );
      const adViews = adAnalytics.reduce(
        (sum, a) => sum + a.completedViews + a.partialViews,
        0
      );

      return {
        _id: ad._id,
        adName: ad.adName,
        status: ad.status,
        mediaType: ad.mediaType,
        duration: ad.duration,
        impressions: adImpressions,
        views: adViews,
        clicks: ad.clicks,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalAds: ads.length,
        activeAds,
        pausedAds,
        expiredAds,
        totalImpressions,
        totalViews,
        ads: adsSummary,
      },
    });
  } catch (error) {
    console.error("Error getting ads metrics summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get ads metrics summary",
    });
  }
};
