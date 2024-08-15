import savedModel from "../model/savedSchema";
import mongoose from "mongoose";

export class SavedRepository {
  async addToSave(saveData:{userId:mongoose.Types.ObjectId,eventId:mongoose.Types.ObjectId}) {
    try {
      const newSave = new savedModel({
         eventId:saveData.eventId,
         userId:saveData.userId 
      });
      const data = await newSave.save();
      return data;
    } catch (error: any) {
      console.log("DB error at addToSave", error.message);
      throw new Error(`DB error at addToSave : ${error.message}`);
    }
  }

  async findOne(userId: any,eventId:any) {
    try {
      const saved = await savedModel.findOne({userId,eventId});
      return saved;
    } catch (error: any) {
      console.log("DB error at Save findOne", error.message);
      throw new Error(`DB error at Save findOne : ${error.message}`);
    }
  }

  async findOneAndUpdate(query: any, update: any) {
    try {
      const updatedSave = await savedModel.findOneAndUpdate(query,update,{new:true});
      return updatedSave;
    } catch (error: any) {
      console.log("DB error at Saved findOneAndUpdate", error.message);
      throw new Error(`DB error at Saved findOneAndUpdate : ${error.message}`);
    }
  }

  async findByUserId(userId: any) {
    try {
      const saved = await savedModel.find({userId}).populate({
        path: 'eventId',
        populate: {
          path: 'hostId',
        }
      })
      return saved;
    } catch (error: any) {
      console.log("DB error at Save findByUserId", error.message);
      throw new Error(`DB error at Save findByUserId : ${error.message}`);
    }
  }

  async findByIdAndDelete(id: any) {
    try {
      const saved = await savedModel.findByIdAndDelete(id);
      return saved;
    } catch (error: any) {
      console.log("DB error at Save findByIdAndDelete", error.message);
      throw new Error(`DB error at Save findByIdAndDelete : ${error.message}`);
    }
  }


}