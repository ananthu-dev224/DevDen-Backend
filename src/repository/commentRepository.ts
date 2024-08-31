import commentModel from "../model/commentSchema";
import { ObjectId } from "mongoose"
import mongoose from "mongoose";


export class CommentRepository {
  async addComment(commentData: {eventId:ObjectId,userId:mongoose.Types.ObjectId,text:string}) {
    try {
      const newComment = new commentModel({
        eventId:commentData.eventId,
        userId:commentData.userId,
        text:commentData.text 
      });
      const savedComment = await newComment.save();
      const populatedComment = await commentModel.findById(savedComment._id).populate<{ userId: any }>({ path: 'userId' });
      return populatedComment;
    } catch (error: any) {
      console.log("DB error at addComment", error.message);
      throw new Error(`DB error at addComment : ${error.message}`);
    }
  }

  async findById(id: any) {
    try {
      const comment = await commentModel.findById(id).populate('userId');
      return comment;
    } catch (error: any) {
      console.log("DB error at comment findById", error.message);
      throw new Error(`DB error at comment findById : ${error.message}`);
    }
  }

  async findByEvent(eventId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(eventId);
      const comment = await commentModel.find({eventId:objectId}).sort({ createdAt: -1 }).populate('userId');
      return comment;
    } catch (error: any) {
      console.log("DB error at comment findByEvent", error.message);
      throw new Error(`DB error at comment findByEvent : ${error.message}`);
    }
  }

  async findOneAndUpdate(query: any, update: any) {
    try {
      const updatedComment = await commentModel.findOneAndUpdate(query,update,{new:true});
      return updatedComment;
    } catch (error: any) {
      console.log("DB error at comment findOneAndUpdate", error.message);
      throw new Error(`DB error at comment findOneAndUpdate : ${error.message}`);
    }
  }

  async findByCommentIdAndDelete(commentId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(commentId);
      const comment = await commentModel.findByIdAndDelete(objectId);
      return comment;
    } catch (error: any) {
      console.log("DB error at comment findByCommentIdAndDelete", error.message);
      throw new Error(`DB error at comment findByCommentIdAndDelete: ${error.message}`);
    }
  }

}