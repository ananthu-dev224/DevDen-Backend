"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeComment = exports.deleteComment = exports.getEventComment = exports.addComment = void 0;
const commentRepository_1 = require("../repository/commentRepository");
const eventRepository_1 = require("../repository/eventRepository");
const notificationsRepository_1 = require("../repository/notificationsRepository");
const userRepository_1 = require("../repository/userRepository");
const mongoose_1 = __importDefault(require("mongoose"));
const commentRepo = new commentRepository_1.CommentRepository();
const eventRepo = new eventRepository_1.EventRepository();
const notiRepo = new notificationsRepository_1.NotificationsRepository();
const userRepo = new userRepository_1.UserRepository();
// Add new comment : /user/add-comment
const addComment = async (req, res) => {
    try {
        const { eventId, text } = req.body;
        const userId = req.user?.userId;
        const userIdObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const event = await eventRepo.findById(eventId);
        if (!event) {
            return res
                .status(404)
                .json({ status: "error", message: "Event unavailable" });
        }
        const eventHostId = event.hostId;
        if (!userId) {
            return res
                .status(404)
                .json({ status: "error", message: "Please login." });
        }
        const data = {
            eventId,
            userId: userIdObjectId,
            text,
        };
        const newComment = await commentRepo.addComment(data);
        const noti = `Comment (${text}) added by @${newComment?.userId.username} for your event(${eventId})`;
        const notification = {
            userId: eventHostId,
            noti,
        };
        await notiRepo.addNotification(notification);
        res.status(200).json({
            message: "Comment added successfully",
            status: "success",
            newComment,
        });
    }
    catch (error) {
        console.log("Error at addComment", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.addComment = addComment;
// event comments : /user/comments/:id
const getEventComment = async (req, res) => {
    try {
        const eventId = req.params.id;
        const comments = await commentRepo.findByEvent(eventId);
        res.status(200).json({
            status: "success",
            comments,
        });
    }
    catch (error) {
        console.log("Error at getEventComment", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getEventComment = getEventComment;
// delete comment : /user/delete-comment/:id
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        await commentRepo.findByCommentIdAndDelete(commentId);
        res.status(200).json({
            status: "success",
        });
    }
    catch (error) {
        console.log("Error at deleteComment", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.deleteComment = deleteComment;
// comment like : /user/like-comment
const likeComment = async (req, res) => {
    try {
        const { commentId } = req.body;
        const comment = await commentRepo.findById(commentId);
        const userId = req.user?.userId;
        const userIdObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const user = await userRepo.findById(userId);
        if (!userId) {
            return res
                .status(404)
                .json({ status: "error", message: "Please login." });
        }
        if (!user) {
            return res
                .status(404)
                .json({ status: "error", message: "Please login." });
        }
        if (!comment) {
            return res
                .status(404)
                .json({ status: "error", message: "Event not found" });
        }
        let updatedLikes;
        let noti;
        if (comment.likes.includes(userIdObjectId)) {
            updatedLikes = comment.likes.filter((id) => !id.equals(userIdObjectId));
            noti = `Your comment (${comment.text}) was unliked by @${user.username}`;
        }
        else {
            updatedLikes = [...comment.likes, userIdObjectId];
            noti = `Your comment (${comment.text}) was liked by @${user.username}`;
        }
        const result = await commentRepo.findOneAndUpdate({ _id: commentId }, { likes: updatedLikes });
        const notification = {
            userId: comment.userId,
            noti,
        };
        await notiRepo.addNotification(notification);
        res.status(200).json({ status: "success", updatedLikes: result?.likes });
    }
    catch (error) {
        console.log("Error at likeComment", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.likeComment = likeComment;
