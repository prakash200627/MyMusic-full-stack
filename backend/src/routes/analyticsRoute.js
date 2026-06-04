import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { logPlayEvent, getUserAnalytics, getAdminAnalytics } from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

// Apply auth protections on all analytical pipelines
analyticsRouter.use(protect);

analyticsRouter.post("/log-play", logPlayEvent);
analyticsRouter.get("/user", getUserAnalytics);
analyticsRouter.get("/admin", authorize('admin'), getAdminAnalytics);

export default analyticsRouter;
