import express from "express";
import {
  adminLogin,
  userManage,
  toggleUser,
  dashboardStati
} from "../controller/adminController";
import { verifyToken, authorizeRole } from "../middleware/adminAuth";
import { getAdminEvents, approveEvent } from "../controller/eventController";
import {reportedComments,reportedEvents,toggleComment,toggleEvent} from "../controller/reportController"

const router = express.Router();

router.post("/login", adminLogin);
router.get("/user-management", verifyToken, authorizeRole("admin"), userManage);
router.get(
  "/user-management/:id",
  verifyToken,
  authorizeRole("admin"),
  toggleUser
);
router.get("/comment-reports", verifyToken, authorizeRole("admin"), reportedComments);
router.get("/event-reports", verifyToken, authorizeRole("admin"), reportedEvents);
router.patch(
  "/report-comment",
  verifyToken,
  authorizeRole("admin"),
  toggleComment
);
router.patch(
  "/report-event",
  verifyToken,
  authorizeRole("admin"),
  toggleEvent
);
router.get(
  "/event-portal",
  verifyToken,
  authorizeRole("admin"),
  getAdminEvents
);
router.get(
  "/event-approve/:id",
  verifyToken,
  authorizeRole("admin"),
  approveEvent
);
router.get(
  "/dashboard",
  verifyToken,
  authorizeRole("admin"),
  dashboardStati
);

export default router;