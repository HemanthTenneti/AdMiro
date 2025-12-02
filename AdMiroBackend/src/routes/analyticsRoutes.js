import express from "express";
import {
  getDisplayMetrics,
  getAdMetrics,
  getDisplaysStatusSummary,
  getAdsMetricsSummary,
} from "../controllers/analyticsController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Display metrics
router.get("/displays/:displayId", getDisplayMetrics);
router.get("/displays-summary", getDisplaysStatusSummary);

// Advertisement metrics
router.get("/ads/:adId", getAdMetrics);
router.get("/ads-summary", getAdsMetricsSummary);

export default router;
