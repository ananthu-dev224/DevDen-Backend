"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRepository = void 0;
const notificationsSchema_1 = __importDefault(require("../model/notificationsSchema"));
class NotificationsRepository {
    async addNotification(data) {
        try {
            const newNotification = new notificationsSchema_1.default({
                text: data.noti,
                userId: data.userId
            });
            const res = await newNotification.save();
            return res;
        }
        catch (error) {
            console.log("DB error at addNotification", error.message);
            throw new Error(`DB error at addNotification : ${error.message}`);
        }
    }
    async findByUserId(userId) {
        try {
            const notifications = await notificationsSchema_1.default.find({ userId }).populate('userId');
            return notifications;
        }
        catch (error) {
            console.log("DB error at notifications findByUserId", error.message);
            throw new Error(`DB error at notifications findByUserId : ${error.message}`);
        }
    }
    async deleteMany(userId) {
        try {
            const notifications = await notificationsSchema_1.default.deleteMany({ userId });
            return notifications;
        }
        catch (error) {
            console.log("DB error at notifications deleteMany", error.message);
            throw new Error(`DB error at notifications deleteMany : ${error.message}`);
        }
    }
}
exports.NotificationsRepository = NotificationsRepository;
