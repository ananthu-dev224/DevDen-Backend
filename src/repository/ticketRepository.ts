import ticketModel from "../model/ticketSchema";
import { ObjectId } from "mongoose"
import mongoose from "mongoose";


export class TicketRepository {
  async addTicket(ticketData : {userId:mongoose.Types.ObjectId,eventId:mongoose.Types.ObjectId,ticketId:string,quantity:number,totalCost:number,sessionId:any,method:any,qrCode:string}) {
    try {
      const newTicket = new ticketModel({
       eventId : ticketData.eventId,
       userId : ticketData.userId,
       ticketId: ticketData.ticketId,
       numberOfTickets: ticketData.quantity,
       paymentMethod: ticketData.method,
       totalCost: ticketData.totalCost,
       qrCode: ticketData.qrCode,
       ...(ticketData.sessionId !== null && {stripe_sessionId : ticketData.sessionId})
      });
      const data = await newTicket.save();
      return data;
    } catch (error: any) {
      console.log("DB error at addTicket", error.message);
      throw new Error(`DB error at addTicket : ${error.message}`);
    }
  }

  async findById(id: any) {
    try {
      const ticket = await ticketModel.findById(id);
      return ticket;
    } catch (error: any) {
      console.log("DB error at Ticket findById", error.message);
      throw new Error(`DB error at Ticket findById : ${error.message}`);
    }
  }

  async findOneAndUpdate(query: any, update: any) {
    try {
      const updatedTicket = await ticketModel.findOneAndUpdate(query,update,{new:true});
      return updatedTicket;
    } catch (error: any) {
      console.log("DB error at Ticket findOneAndUpdate", error.message);
      throw new Error(`DB error at Ticket findOneAndUpdate : ${error.message}`);
    }
  }

  async findByEventId(eventId:any) {
    try {
      const tickets = await ticketModel.find({eventId:eventId}).populate('eventId').populate('userId');
      return tickets;
    } catch (error: any) {
      console.log("DB error at Ticket findByEventId", error.message);
      throw new Error(`DB error at Ticket findByEventId : ${error.message}`);
    }
  }

  async findByTicketId(ticketId:any) {
    try {
      const tickets = await ticketModel.findOne({ticketId:ticketId}).populate({
        path: 'eventId',
        populate: {
          path: 'hostId',
          select: 'username email'
        }
      }).populate('userId');
      return tickets;
    } catch (error: any) {
      console.log("DB error at Ticket findByTicketId", error.message);
      throw new Error(`DB error at Ticket findByTicketId : ${error.message}`);
    }
  }

  async findByUserId(userId: any) {
    try {
      const ticket = await ticketModel
      .find({ userId: userId })
      .populate({
        path: 'eventId',
        populate: {
          path: 'hostId',
          select: 'username email'
        }
      })
      .populate('userId');
      return ticket;
    } catch (error: any) {
      console.log("DB error at Ticket findByUserId", error.message);
      throw new Error(`DB error at Ticket findByUserId : ${error.message}`);
    }
  }

  async findByStripeId(sessionId: any) {
    try {
      const ticket = await ticketModel.findOne({stripe_sessionId:sessionId}).populate('eventId').populate('userId');
      return ticket;
    } catch (error: any) {
      console.log("DB error at Ticket findByStripeId", error.message);
      throw new Error(`DB error at Ticket findByStripeId : ${error.message}`);
    }
  }


}