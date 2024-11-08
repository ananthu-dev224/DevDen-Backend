import eventModel from "../model/eventSchema";

import { eventData } from "../types/types";


export class EventRepository {
  async addEvent(eventData: eventData) {
    try {
      const newEvent = new eventModel({
        hostId: eventData.hostId,
        image: eventData.image,
        description: eventData.description,
        date:eventData.date,
        time:eventData.time,
        venue:eventData.venue,
        isFree:eventData.isFree,
        ...(eventData.isFree === false && { totalTickets: eventData.totalTickets, ticketPrice: eventData.ticketPrice }), 
      });
      const data = await newEvent.save();
      return data;
    } catch (error: any) {
      console.log("DB error at addEvent", error.message);
      throw new Error(`DB error at addEvent : ${error.message}`);
    }
  }

  async findById(id: any) {
    try {
      const event = await eventModel.findById(id);
      return event;
    } catch (error: any) {
      console.log("DB error at Event findById", error.message);
      throw new Error(`DB error at Event findById : ${error.message}`);
    }
  }

  async findOneAndUpdate(query: any, update: any) {
    try {
      const updatedEvent = await eventModel.findOneAndUpdate(query,update,{new:true});
      return updatedEvent;
    } catch (error: any) {
      console.log("DB error at Event findOneAndUpdate", error.message);
      throw new Error(`DB error at Event findOneAndUpdate : ${error.message}`);
    }
  }

  async allEvents() {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const events = await eventModel.find({isActive:true, date: { $gt: today.toISOString() }, isApproved:true}).populate('hostId');
      return events;
    } catch (error: any) {
      console.log("DB error at Event allEvents", error.message);
      throw new Error(`DB error at Event allEvents : ${error.message}`);
    }
  }

  async activeEvents() {
    try {
      const events = await eventModel.find({isActive:true})
      return events;
    } catch (error: any) {
      console.log("DB error at Event activeEvents", error.message);
      throw new Error(`DB error at Event activeEvents : ${error.message}`);
    }
  }

  async createdEvents(userId:any) {
    try {
      const events = await eventModel.find({ hostId: userId,isActive:true }).populate('hostId');
      return events;
    } catch (error: any) {
      console.log("DB error at Event createdEvents", error.message);
      throw new Error(`DB error at Event createdEvents : ${error.message}`);
    }
  }

  async followingEvents(followingIds:any) {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const events = await eventModel.find({ hostId: { $in: followingIds },isActive:true, date: { $gt: today.toISOString() }, isApproved:true }).sort({ createdAt: -1 }).populate('hostId');
      return events;
    } catch (error: any) {
      console.log("DB error at Event followingEvents", error.message);
      throw new Error(`DB error at Event followingEvents : ${error.message}`);
    }
  }


  async userEvents(userId:any) {
    try {
      const events = await eventModel.find({ hostId: userId,isActive:true,isApproved:true }).populate('hostId');
      return events;
    } catch (error: any) {
      console.log("DB error at Event createdEvents", error.message);
      throw new Error(`DB error at Event createdEvents : ${error.message}`);
    }
  }

  async adminEvents() {
    try {
      const events = await eventModel.find({isApproved:false }).populate('hostId');
      return events;
    } catch (error: any) {
      console.log("DB error at Event adminEvents", error.message);
      throw new Error(`DB error at Event adminEvents : ${error.message}`);
    }
  }

  async topHosts(){
    try {
      const data = await eventModel.aggregate([
        // Group by hostId to count the number of events per user
        {
          $group: {
            _id: "$hostId",
            eventCount: { $sum: 1 }
          }
        },
        // Sort by event count in descending order
        { $sort: { eventCount: -1 } },
        // Limit to top 5 hosts
        { $limit: 5 },
        // Lookup user details for each host
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        // Unwind the userDetails array to make it a single object
        { $unwind: "$userDetails" },
        // Project the necessary fields
        {
          $project: {
            _id: 1,
            username: "$userDetails.username",
            dp: "$userDetails.dp",
            eventCount: 1
          }
        }
      ]);
      return data;  
    } catch (error: any) {
      console.log("DB error at Event topHosts", error.message);
      throw new Error(`DB error at Event topHosts : ${error.message}`);
    }
  }
}