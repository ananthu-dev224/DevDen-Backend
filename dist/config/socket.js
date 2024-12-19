"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userRepository_1 = require("../repository/userRepository");
const chatRepository_1 = require("../repository/chatRepository");
const userRepo = new userRepository_1.UserRepository();
const chatRepo = new chatRepository_1.ChatRepository();
const socketConfig = (io) => {
    io.on("connection", (socket) => {
        console.log("user connected :", socket.id);
        // Listen for typing events
        socket.on("typing", (data) => {
            socket.to(data.conversationId).emit("typing", data.userId);
        });
        socket.on("stopTyping", (data) => {
            socket.to(data.conversationId).emit("stopTyping", data.userId);
        });
        socket.on("deleteMessage", async (data) => {
            console.log("Message deleted:", data);
            io.to(data.conversationId).emit("deleteMessage", data); // Emit the deleted message to the specific conversation's room
        });
        socket.on("sendMessage", async (data) => {
            console.log("Message received:", data);
            io.to(data.conversationId).emit("message", data); // Emit the message to the specific conversation's room
        });
        socket.on("markAsRead", async (data) => {
            const { conversationId, userId } = data;
            await chatRepo.updateReadChats(conversationId, userId);
            // Notify other users in the conversation that the messages have been read
            io.to(conversationId).emit("messagesRead", { conversationId, userId });
        });
        // Handle joining a conversation room
        socket.on("joinConversation", async (data) => {
            const { userId, conversationId } = data;
            console.log(`User ${socket.id} and Id ${userId} joined conversation ${conversationId}`);
            socket.userId = userId;
            await userRepo.findOneAndUpdate({ _id: userId }, { chatStatus: "Online" });
            socket.join(conversationId);
        });
        // Handle leaving a conversation room
        socket.on("leaveConversation", async (data) => {
            const { userId, conversationId } = data;
            socket.leave(conversationId);
            if (userId) {
                await userRepo.findOneAndUpdate({ _id: userId }, { chatStatus: "Offline", lastSeen: new Date() });
            }
            console.log(`User ${socket.id} and Id ${userId} left conversation ${conversationId}`);
        });
        socket.on("startCall", (data) => {
            const { conversationId, userId } = data;
            // Emit the 'incomingCall' event to everyone in the room except the caller
            socket
                .to(conversationId)
                .emit("incomingCall", { userId, callConversationId: conversationId });
            console.log(`Call started in conversation ${conversationId}`);
        });
        // Handle accepting a call
        socket.on("acceptCall", (data) => {
            const { conversationId, userId } = data;
            // Notify all users in the conversation that the call has been accepted
            io.to(conversationId).emit("callAccepted", { userId });
            console.log(`Call accepted by user ${userId} in conversation ${conversationId}`);
        });
        // Handle declining a call
        socket.on("declineCall", (data) => {
            const { conversationId, userId } = data;
            // Notify all users in the conversation that the call has been declined
            io.to(conversationId).emit("callDeclined", { userId });
            console.log(`Call declined by user ${userId} in conversation ${conversationId}`);
        });
        // Handle disconnection
        socket.on("disconnect", async () => {
            const userId = socket.userId;
            if (userId) {
                await userRepo.findOneAndUpdate({ _id: userId }, { chatStatus: "Offline", lastSeen: new Date() });
            }
            console.log("User disconnected", socket.id);
        });
    });
};
exports.default = socketConfig;
