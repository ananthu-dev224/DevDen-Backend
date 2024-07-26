import express from "express";
import {
  adminLogin,
  userManage,
  toggleUser,
} from "../controller/adminController";
import { verifyToken, authorizeRole } from "../middleware/adminAuth";
import { getAdminEvents, approveEvent } from "../controller/eventController";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/user-management", verifyToken, authorizeRole("admin"), userManage);
router.get(
  "/user-management/:id",
  verifyToken,
  authorizeRole("admin"),
  toggleUser
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

export default router;