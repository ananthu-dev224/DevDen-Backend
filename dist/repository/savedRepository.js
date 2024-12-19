"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedRepository = void 0;
const savedSchema_1 = __importDefault(require("../model/savedSchema"));
class SavedRepository {
    async addToSave(saveData) {
        try {
            const newSave = new savedSchema_1.default({
                eventId: saveData.eventId,
                userId: saveData.userId
            });
            const data = await newSave.save();
            return data;
        }
        catch (error) {
            console.log("DB error at addToSave", error.message);
            throw new Error(`DB error at addToSave : ${error.message}`);
        }
    }
    async findOne(userId, eventId) {
        try {
            const saved = await savedSchema_1.default.findOne({ userId, eventId });
            return saved;
        }
        catch (error) {
            console.log("DB error at Save findOne", error.message);
            throw new Error(`DB error at Save findOne : ${error.message}`);
        }
    }
    async findOneAndUpdate(query, update) {
        try {
            const updatedSave = await savedSchema_1.default.findOneAndUpdate(query, update, { new: true });
            return updatedSave;
        }
        catch (error) {
            console.log("DB error at Saved findOneAndUpdate", error.message);
            throw new Error(`DB error at Saved findOneAndUpdate : ${error.message}`);
        }
    }
    async findByUserId(userId) {
        try {
            const saved = await savedSchema_1.default.find({ userId }).populate({
                path: 'eventId',
                populate: {
                    path: 'hostId',
                }
            });
            return saved;
        }
        catch (error) {
            console.log("DB error at Save findByUserId", error.message);
            throw new Error(`DB error at Save findByUserId : ${error.message}`);
        }
    }
    async findByIdAndDelete(id) {
        try {
            const saved = await savedSchema_1.default.findByIdAndDelete(id);
            return saved;
        }
        catch (error) {
            console.log("DB error at Save findByIdAndDelete", error.message);
            throw new Error(`DB error at Save findByIdAndDelete : ${error.message}`);
        }
    }
}
exports.SavedRepository = SavedRepository;
