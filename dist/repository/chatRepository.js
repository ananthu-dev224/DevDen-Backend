"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const conversationSchema_1 = __importDefault(require("../model/conversationSchema"));
const chatSchema_1 = __importDefault(require("../model/chatSchema"));
class ChatRepository {
    async createConversation(conversationData) {
        try {
            const newConversation = new conversationSchema_1.default({
                members: [conversationData.senderId, conversationData.recieverId],
            });
            const res = await newConversation.save();
            return res;
        }
        catch (error) {
            console.log("DB error at createConversation", error.message);
            throw new Error(`DB error at createConversation : ${error.message}`);
        }
    }
    async findTwoUserConversation(senderId, receiverId) {
        try {
            const res = await conversationSchema_1.default
                .findOne({ members: { $all: [senderId, receiverId] } })
                .populate("members");
            return res;
        }
        catch (error) {
            console.log("DB error at findConversation", error.message);
            throw new Error(`DB error at findConversation : ${error.message}`);
        }
    }
    async findUserConversation(userId) {
        try {
            const res = await conversationSchema_1.default
                .find({ members: { $in: [userId] } })
                .populate("members");
            return res;
        }
        catch (error) {
            console.log("DB error at findUserConversation", error.message);
            throw new Error(`DB error at findUserConversation : ${error.message}`);
        }
    }
    async findUserConversationById(convId) {
        try {
            const res = await conversationSchema_1.default.findById(convId).populate("members");
            return res;
        }
        catch (error) {
            console.log("DB error at findUserConversationById", error.message);
            throw new Error(`DB error at findUserConversationById : ${error.message}`);
        }
    }
    async addNewMessage(conversationId, sender, text, replyTo, content) {
        try {
            const newMessage = new chatSchema_1.default({
                conversationId,
                senderId: sender,
                text,
                replyTo,
                content,
                readBy: [sender]
            });
            await conversationSchema_1.default.findByIdAndUpdate(conversationId, { updatedAt: Date.now() }, { new: true });
            const savedMessage = await newMessage
                .save()
                .then(async (msg) => (await msg.populate("replyTo")).populate("senderId"));
            return savedMessage;
        }
        catch (error) {
            console.log("DB error at addNewMessage", error.message);
            throw new Error(`DB error at addNewMessage : ${error.message}`);
        }
    }
    async updateReadChats(conversationId, userId) {
        try {
            const messages = await chatSchema_1.default.updateMany({ conversationId, readBy: { $ne: userId } }, { $push: { readBy: userId } });
            return messages;
        }
        catch (error) {
            console.log("DB error at updateReadChats", error.message);
            throw new Error(`DB error at updateReadChats : ${error.message}`);
        }
    }
    async fetchMessages(conversationId) {
        try {
            const messages = await chatSchema_1.default
                .find({ conversationId: conversationId })
                .populate("senderId")
                .populate("replyTo");
            return messages;
        }
        catch (error) {
            console.log("DB error at fetchMessages", error.message);
            throw new Error(`DB error at fetchMessages : ${error.message}`);
        }
    }
    async findByMessageIdAndDelete(messageId) {
        try {
            const objectId = new mongoose_1.default.Types.ObjectId(messageId);
            const message = await chatSchema_1.default.findByIdAndDelete(objectId);
            return message;
        }
        catch (error) {
            console.log("DB error at chat findByMessageIdAndDelete", error.message);
            throw new Error(`DB error at chat findByMessageIdAndDelete: ${error.message}`);
        }
    }
}
exports.ChatRepository = ChatRepository;
