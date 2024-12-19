"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const commentSchema_1 = __importDefault(require("../model/commentSchema"));
const mongoose_1 = __importDefault(require("mongoose"));
class CommentRepository {
    async addComment(commentData) {
        try {
            const newComment = new commentSchema_1.default({
                eventId: commentData.eventId,
                userId: commentData.userId,
                text: commentData.text
            });
            const savedComment = await newComment.save();
            const populatedComment = await commentSchema_1.default.findById(savedComment._id).populate({ path: 'userId' });
            return populatedComment;
        }
        catch (error) {
            console.log("DB error at addComment", error.message);
            throw new Error(`DB error at addComment : ${error.message}`);
        }
    }
    async findById(id) {
        try {
            const comment = await commentSchema_1.default.findById(id).populate('userId');
            return comment;
        }
        catch (error) {
            console.log("DB error at comment findById", error.message);
            throw new Error(`DB error at comment findById : ${error.message}`);
        }
    }
    async findByEvent(eventId) {
        try {
            const objectId = new mongoose_1.default.Types.ObjectId(eventId);
            const comment = await commentSchema_1.default.find({ eventId: objectId }).sort({ createdAt: -1 }).populate('userId');
            return comment;
        }
        catch (error) {
            console.log("DB error at comment findByEvent", error.message);
            throw new Error(`DB error at comment findByEvent : ${error.message}`);
        }
    }
    async findOneAndUpdate(query, update) {
        try {
            const updatedComment = await commentSchema_1.default.findOneAndUpdate(query, update, { new: true });
            return updatedComment;
        }
        catch (error) {
            console.log("DB error at comment findOneAndUpdate", error.message);
            throw new Error(`DB error at comment findOneAndUpdate : ${error.message}`);
        }
    }
    async findByCommentIdAndDelete(commentId) {
        try {
            const objectId = new mongoose_1.default.Types.ObjectId(commentId);
            const comment = await commentSchema_1.default.findByIdAndDelete(objectId);
            return comment;
        }
        catch (error) {
            console.log("DB error at comment findByCommentIdAndDelete", error.message);
            throw new Error(`DB error at comment findByCommentIdAndDelete: ${error.message}`);
        }
    }
}
exports.CommentRepository = CommentRepository;
