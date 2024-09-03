import express from "express";
import {
  userLogin,
  signup,
  verifyOtp,
  resendOtp,
  forgotPassword,
  validateResetToken,
  resetPassword,
  googleAuth,
} from "../controller/userController";
import { editProfile } from "../controller/profileController";
import {
  generateSignature,
  updateBanner,
  updateDp,
} from "../controller/cloudinaryController";
import {
  addEvent,
  getEvents,
  getCreatedEvents,
  abortEvent,
  editEvent,
  likeEvent,
  isSaved,
  saveEvent,
  userSaved,
  getAllEvents
} from "../controller/eventController";
import {
  addComment,
  getEventComment,
  deleteComment,
  likeComment,
} from "../controller/commentController";
import {
  searchUsers,
  getUserDetails,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controller/networkController";
import { checkoutSession, buyTicket, userTickets, eventDetails, cancelTicket, downloadTicketPDF, verifyStatus } from "../controller/ticketController";
import {addOrGetConversation,addMessage,getConversation,getConversationUser,getMessages,deleteMessage} from '../controller/chatController'
import { withdraw, notifications, clearNotifications } from "../controller/notificationController";
import { reportComment, reportEvent } from "../controller/reportController";
import { verifyToken, authorizeRole } from "../middleware/userAuth";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", userLogin);
router.post("/forgot-password", forgotPassword);
router.get("/validate-reset-token/:token", validateResetToken);
router.post("/reset-password", resetPassword);
router.post("/oauth", googleAuth);
router.post("/edit-profile", verifyToken, authorizeRole("user"), editProfile);
router.get(
  "/cloud-signature",
  verifyToken,
  authorizeRole("user"),
  generateSignature
);
router.post("/edit-dp", verifyToken, authorizeRole("user"), updateDp);
router.post("/edit-banner", verifyToken, authorizeRole("user"), updateBanner);
router.post("/create-event", verifyToken, authorizeRole("user"), addEvent);
router.get("/events", verifyToken, authorizeRole("user"), getEvents);
router.get("/all-events", verifyToken, authorizeRole("user"), getAllEvents);
router.get("/event/:id", verifyToken, authorizeRole("user"), getCreatedEvents);
router.post("/edit-event", verifyToken, authorizeRole("user"), editEvent);
router.get("/abort-event/:id", verifyToken, authorizeRole("user"), abortEvent);
router.post("/like-event", verifyToken, authorizeRole("user"), likeEvent);
router.get(
  "/comments/:id",
  verifyToken,
  authorizeRole("user"),
  getEventComment
);
router.post("/add-comment", verifyToken, authorizeRole("user"), addComment);
router.delete(
  "/delete-comment/:id",
  verifyToken,
  authorizeRole("user"),
  deleteComment
);
router.post("/like-comment", verifyToken, authorizeRole("user"), likeComment);
router.get("/search/:query", verifyToken, authorizeRole("user"), searchUsers);
router.get("/profile/:id", verifyToken, authorizeRole("user"), getUserDetails);
router.post("/follow", verifyToken, authorizeRole("user"), followUser);
router.post("/unfollow", verifyToken, authorizeRole("user"), unfollowUser);
router.get("/followers/:id", verifyToken, authorizeRole("user"), getFollowers);
router.get("/following/:id", verifyToken, authorizeRole("user"), getFollowing);
router.post("/checkout-session",verifyToken, authorizeRole("user"), checkoutSession);
router.post("/ticket",verifyToken, authorizeRole("user"), buyTicket);
router.get('/my-tickets',verifyToken, authorizeRole("user"), userTickets);
router.get("/event-details/:id", verifyToken, authorizeRole("user"), eventDetails);
router.post("/cancel-ticket",verifyToken, authorizeRole("user"), cancelTicket);
router.get("/download-ticket/:id", verifyToken, authorizeRole("user"), downloadTicketPDF);
router.get("/verify-qr/:id", verifyToken, authorizeRole("user"), verifyStatus);
router.post("/save-event",verifyToken, authorizeRole("user"), saveEvent);
router.get("/save-event",verifyToken, authorizeRole("user"), isSaved);
router.get("/saved",verifyToken, authorizeRole("user"), userSaved);
router.post("/conversation",verifyToken, authorizeRole("user"), addOrGetConversation);
router.get("/conversation",verifyToken, authorizeRole("user"), getConversation); //by conversation id
router.get("/conversation/:userId",verifyToken, authorizeRole("user"), getConversationUser); //by userId all conversations
router.post("/message",verifyToken, authorizeRole("user"), addMessage);
router.get("/message/:conversationId",verifyToken, authorizeRole("user"), getMessages); //all messages of a conversation
router.delete(
  "/delete-message/:id",
  verifyToken,
  authorizeRole("user"),
  deleteMessage
);
router.post("/withdraw",verifyToken, authorizeRole("user"), withdraw);
router.get("/notifications",verifyToken, authorizeRole("user"), notifications);
router.get("/clear-notifications",verifyToken, authorizeRole("user"), clearNotifications);
router.post("/report-event",verifyToken, authorizeRole("user"), reportEvent);
router.post("/report-comment",verifyToken, authorizeRole("user"), reportComment);







export default router;