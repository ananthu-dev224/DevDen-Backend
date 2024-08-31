import notificationsModel from "../model/notificationsSchema";
import mongoose from "mongoose";


export class NotificationsRepository {
    async addNotification(data:{userId:any,noti:String}) {
      try {
        const newNotification = new notificationsModel({
           text:data.noti,
           userId:data.userId 
        });
        const res = await newNotification.save();
        return res;
      } catch (error: any) {
        console.log("DB error at addNotification", error.message);
        throw new Error(`DB error at addNotification : ${error.message}`);
      }
    }
  
    async findByUserId(userId: any) {
      try {
        const notifications = await notificationsModel.find({userId}).populate('userId')
        return notifications;
      } catch (error: any) {
        console.log("DB error at notifications findByUserId", error.message);
        throw new Error(`DB error at notifications findByUserId : ${error.message}`);
      }
    }
  
}