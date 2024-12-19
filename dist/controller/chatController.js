"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.getMessages = exports.addMessage = exports.getConversation = exports.getConversationUser = exports.addOrGetConversation = void 0;
const chatRepository_1 = require("../repository/chatRepository");
const userRepository_1 = require("../repository/userRepository");
const notificationsRepository_1 = require("../repository/notificationsRepository");
const mongoose_1 = __importDefault(require("mongoose"));
const chatRepo = new chatRepository_1.ChatRepository();
const userRepo = new userRepository_1.UserRepository();
const notiRepo = new notificationsRepository_1.NotificationsRepository();
// add or get conversation : POST =>  /user/conversation
const addOrGetConversation = async (req, res) => {
    const { recieverId } = req.body;
    const senderId = req.user?.userId;
    const userIdObjectId = new mongoose_1.default.Types.ObjectId(senderId);
    try {
        const sender = await userRepo.findById(senderId);
        if (!sender) {
            return res
                .status(404)
                .json({ status: "error", message: "User not found" });
        }
        const exisitingConversation = await chatRepo.findTwoUserConversation(senderId, recieverId);
        if (exisitingConversation) {
            return res
                .status(200)
                .json({ status: "success", conversation: exisitingConversation });
        }
        const conversation = await chatRepo.createConversation({
            senderId: userIdObjectId,
            recieverId,
        });
        const noti = `@${sender.username} started a conversation with you.`;
        const notification = {
            userId: recieverId,
            noti,
        };
        await notiRepo.addNotification(notification);
        res.status(200).json({ status: "success", conversation });
    }
    catch (error) {
        console.log("Error at addConversation", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.addOrGetConversation = addOrGetConversation;
// get conversation by one user  : GET =>  /user/conversation
const getConversationUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const conversation = await chatRepo.findUserConversation(userId);
        if (!conversation) {
            return res
                .status(400)
                .json({
                status: "error",
                message: "Error during finding conversation",
            });
        }
        res.status(200).json({ status: "success", conversation });
    }
    catch (error) {
        console.log("Error at getConversationUser", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getConversationUser = getConversationUser;
// get conversation by id  : GET =>  /user/conversation?conversationId=''
const getConversation = async (req, res) => {
    const convId = req.query.conversationId;
    const userId = req.user?.userId;
    try {
        const conversation = await chatRepo.findUserConversationById(convId);
        if (!conversation) {
            return res
                .status(400)
                .json({
                status: "error",
                message: "Error during finding conversation",
            });
        }
        const otherMember = conversation.members.find((member) => member._id.toString() !== userId);
        if (!otherMember) {
            return res.status(400).json({ status: "error", message: "No members" });
        }
        const otherUser = await userRepo.findById(otherMember._id);
        res.status(200).json({ status: "success", conversation, otherUser });
    }
    catch (error) {
        console.log("Error at getConversation", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getConversation = getConversation;
// addMessage : POST =>  /user/message
const addMessage = async (req, res) => {
    const { conversationId, text, replyTo, content } = req.body;
    const sender = req.user?.userId;
    try {
        let newMessage;
        if (replyTo !== null) {
            newMessage = await chatRepo.addNewMessage(conversationId, sender, text, replyTo._id, content || "word");
        }
        else {
            newMessage = await chatRepo.addNewMessage(conversationId, sender, text, replyTo, content || "word");
        }
        res.status(200).json({ status: "success", message: newMessage });
    }
    catch (error) {
        console.log("Error at addMessage", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.addMessage = addMessage;
// get messages : GET =>  /user/message
const getMessages = async (req, res) => {
    const conversationId = req.params.conversationId;
    try {
        const messages = await chatRepo.fetchMessages(conversationId);
        if (!messages) {
            return res.status(400).json({ status: "error", message: "No messages" });
        }
        res.status(200).json({ status: "success", messages });
    }
    catch (error) {
        console.log("Error at getMessages", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getMessages = getMessages;
// delete message : Delete =>  /user/delete-message/:messageId
const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        await chatRepo.findByMessageIdAndDelete(messageId);
        res.status(200).json({
            status: "success",
        });
    }
    catch (error) {
        console.log("Error at deleteMessage", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.deleteMessage = deleteMessage;
