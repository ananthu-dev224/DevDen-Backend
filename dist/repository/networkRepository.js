"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkRepository = void 0;
const networkSchema_1 = __importDefault(require("../model/networkSchema"));
class NetworkRepository {
    async addNetwork(userId, followerId) {
        try {
            // Add follower to user's followers list
            await networkSchema_1.default.updateOne({ userId }, { $addToSet: { following: followerId } }, { upsert: true });
            // Add user to follower's following list
            await networkSchema_1.default.updateOne({ userId: followerId }, { $addToSet: { followers: userId } }, { upsert: true });
        }
        catch (error) {
            console.log("DB error at addNetwork", error.message);
            throw new Error(`DB error at addNetwork: ${error.message}`);
        }
    }
    async removeNetwork(userId, followerId) {
        try {
            // Remove follower from user's followers list
            await networkSchema_1.default.updateOne({ userId }, { $pull: { following: followerId } });
            // Remove user from follower's following list
            await networkSchema_1.default.updateOne({ userId: followerId }, { $pull: { followers: userId } });
        }
        catch (error) {
            console.log("DB error at removeNetwork", error.message);
            throw new Error(`DB error at removeNetwork: ${error.message}`);
        }
    }
    async getFollowers(userId) {
        try {
            const network = await networkSchema_1.default.findOne({ userId }).populate({
                path: 'followers',
                select: 'username name dp'
            });
            return network ? network.followers : [];
        }
        catch (error) {
            console.log("DB error at getFollowers", error.message);
            throw new Error(`DB error at getFollowers: ${error.message}`);
        }
    }
    async getFollowing(userId) {
        try {
            const network = await networkSchema_1.default.findOne({ userId }).populate({
                path: 'following',
                select: 'username name dp'
            });
            return network ? network.following : [];
        }
        catch (error) {
            console.log("DB error at getFollowing", error.message);
            throw new Error(`DB error at getFollowing: ${error.message}`);
        }
    }
}
exports.NetworkRepository = NetworkRepository;
