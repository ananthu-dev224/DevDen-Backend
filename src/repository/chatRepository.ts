import { ObjectId } from "mongoose"
import mongoose from "mongoose";
import conversation from "../model/conversationSchema";
import chat from "../model/chatSchema";


export class ChatRepository {
    async createConversation(conversationData: {senderId:any,recieverId:any}) {
      try {
        const newConversation = new conversation({
            members:[conversationData.senderId,conversationData.recieverId]
        })
        const res = await newConversation.save();
        return res;
      } catch (error: any) {
        console.log("DB error at createConversation", error.message);
        throw new Error(`DB error at createConversation : ${error.message}`);
      }
    }

    async findTwoUserConversation(senderId:any,receiverId:any) {
        try {
          const res = await conversation.findOne({members: {$all: [senderId,receiverId]}}).populate("members");
          return res;
        } catch (error: any) {
          console.log("DB error at findConversation", error.message);
          throw new Error(`DB error at findConversation : ${error.message}`);
        }
      }
    
      async findUserConversation(userId:any) {
        try {
          const res = await conversation.find({members: {$in: [userId]}}).populate("members");
          return res;
        } catch (error: any) {
          console.log("DB error at findUserConversation", error.message);
          throw new Error(`DB error at findUserConversation : ${error.message}`);
        }
      }

      async findUserConversationById(convId:any) {
        try {
          const res = await conversation.findById(convId).populate("members");
          return res;
        } catch (error: any) {
          console.log("DB error at findUserConversationById", error.message);
          throw new Error(`DB error at findUserConversationById : ${error.message}`);
        }
      }


      async addNewMessage(  conversationId: string,
        sender: any,
        text: string) {
        try {
          const newMessage = new chat({conversationId,senderId:sender,text})
          await conversation.findByIdAndUpdate(conversationId,{updatedAt: Date.now()},{new:true});
          const res = await newMessage.save()
          return res;
        } catch (error: any) {
          console.log("DB error at addNewMessage", error.message);
          throw new Error(`DB error at addNewMessage : ${error.message}`);
        }
      }

      async fetchMessages(conversationId: string) {
        try {
          const messages = await chat.find({conversationId:conversationId}).populate("senderId");
          return messages;
        } catch (error: any) {
          console.log("DB error at fetchMessages", error.message);
          throw new Error(`DB error at fetchMessages : ${error.message}`);
        }
      }

}