import { Request, Response } from "express";
import { ChatRepository } from "../repository/chatRepository";
import { UserRepository } from "../repository/userRepository";
import mongoose from "mongoose";


const chatRepo = new ChatRepository();
const userRepo = new UserRepository();

// add or get conversation : POST =>  /user/conversation
export const addOrGetConversation = async (req: Request, res: Response) => {
    const { recieverId } = req.body;
    const senderId = req.user?.userId;
    const userIdObjectId = new mongoose.Types.ObjectId(senderId)
    try {
      const exisitingConversation = await chatRepo.findTwoUserConversation(senderId, recieverId);
      if(exisitingConversation){
        return res.status(200).json({status:'success',conversation:exisitingConversation})
      }
        const conversation = await chatRepo.createConversation({senderId:userIdObjectId,recieverId})
        res.status(200).json({status:'success',conversation})
    } catch (error: any) {
      console.log("Error at addConversation", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};


// get conversation by one user  : GET =>  /user/conversation
export const getConversationUser = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    try {
      const conversation = await chatRepo.findUserConversation(userId)
      if(!conversation){
        return res.status(400).json({status:'error',message:'Error during finding conversation'})
      }
      res.status(200).json({status:'success',conversation})
    } catch (error: any) {
      console.log("Error at getConversationUser", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};

// get conversation by id  : GET =>  /user/conversation?conversationId=''
export const getConversation = async (req: Request, res: Response) => {
  const convId = req.query.conversationId;
  const userId = req.user?.userId;
  try {
    const conversation = await chatRepo.findUserConversationById(convId)
    if(!conversation){
      return res.status(400).json({status:'error',message:'Error during finding conversation'})
    }
    const otherMember = conversation.members.find((member: any) => member._id.toString() !== userId);
    if(!otherMember){
      return res.status(400).json({ status: 'error', message: 'No members' });
    }
    const otherUser = await userRepo.findById(otherMember._id)
    res.status(200).json({status:'success',conversation,otherUser})
  } catch (error: any) {
    console.log("Error at getConversation", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// addMessage : POST =>  /user/message
export const addMessage = async (req: Request, res: Response) => {
    const { conversationId, text } = req.body;
    const sender = req.user?.userId;
    try {
      const newMessage = await chatRepo.addNewMessage(conversationId, sender, text)
      res.status(200).json({status:'success',newMessage});
    } catch (error: any) {
      console.log("Error at addMessage", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};

// get messages : GET =>  /user/message
export const getMessages = async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId;
    try {
      const messages = await chatRepo.fetchMessages(conversationId);
      if(!messages){
        return res.status(400).json({ status: 'error', message: 'No messages' });
      }
      res.status(200).json({ status: 'success', messages });
    } catch (error: any) {
      console.log("Error at getMessages", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};

// delete message : Delete =>  /user/delete-message/:messageId
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;
    await chatRepo.findByMessageIdAndDelete(messageId)  
    res.status(200).json({
      status: "success",
    });
  } catch (error: any) {
    console.log("Error at deleteMessage", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};
