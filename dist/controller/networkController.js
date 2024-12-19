"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = exports.getUserDetails = exports.searchUsers = void 0;
const userRepository_1 = require("../repository/userRepository");
const notificationsRepository_1 = require("../repository/notificationsRepository");
const networkRepository_1 = require("../repository/networkRepository");
const eventRepository_1 = require("../repository/eventRepository");
const userRepo = new userRepository_1.UserRepository();
const networkRepo = new networkRepository_1.NetworkRepository();
const eventRepo = new eventRepository_1.EventRepository();
const notiRepo = new notificationsRepository_1.NotificationsRepository();
// search users : /user/search/:query
const searchUsers = async (req, res) => {
    try {
        const query = req.params.query;
        const users = await userRepo.searchUsers(query);
        res.status(200).json({ status: "success", users });
    }
    catch (error) {
        console.log("Error at searchUsers", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.searchUsers = searchUsers;
// get user data : /user/profile/:userId
const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userRepo.findById(userId);
        const events = await eventRepo.userEvents(userId);
        const sortedEvents = events.sort((a, b) => {
            return Number(b.createdAt) - Number(a.createdAt);
        });
        res.status(200).json({ status: "success", user, events: sortedEvents });
    }
    catch (error) {
        console.log("Error at getUserDetails", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getUserDetails = getUserDetails;
// follow : /user/follow
const followUser = async (req, res) => {
    try {
        const { followerId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(400)
                .json({ message: "User ID is required", status: "error" });
        }
        const user = await userRepo.findById(userId);
        if (!user) {
            return res
                .status(400)
                .json({ message: "User not found", status: "error" });
        }
        const noti = `@${user.username} started following you`;
        const notification = {
            userId: followerId,
            noti,
        };
        await Promise.all([
            networkRepo.addNetwork(userId, followerId),
            notiRepo.addNotification(notification),
        ]);
        res
            .status(200)
            .json({ message: "Followed successfully", status: "success" });
    }
    catch (error) {
        console.error("Error following user:", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.followUser = followUser;
// unfollow : /user/unfollow
const unfollowUser = async (req, res) => {
    try {
        const { followerId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(400)
                .json({ message: "User ID is required", status: "error" });
        }
        await networkRepo.removeNetwork(userId, followerId);
        res
            .status(200)
            .json({ message: "Unfollowed successfully", status: "success" });
    }
    catch (error) {
        console.error("Error unfollowing user:", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.unfollowUser = unfollowUser;
// followers : /user/followers/:userId
const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;
        const followers = await networkRepo.getFollowers(userId);
        res.status(200).json({ status: "success", followers });
    }
    catch (error) {
        console.error("Error retrieving followers:", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getFollowers = getFollowers;
// following : /user/following/:userId
const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;
        const following = await networkRepo.getFollowing(userId);
        res.status(200).json({ status: "success", following });
    }
    catch (error) {
        console.error("Error retrieving following:", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getFollowing = getFollowing;
