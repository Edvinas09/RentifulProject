import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createApplication, listApplications, updateApplicationStatus } from "../controllers/applicationControllers";
const router = express.Router();

router.post("/", authMiddleware(["tenant"]), createApplication);
router.post("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);
router.get("/:id/status", authMiddleware(["manager", "tenant"]), listApplications);

export default router;
