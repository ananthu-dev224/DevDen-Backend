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
      const events = await eventModel.find().populate('hostId');
      return events;
    } catch (error: any) {
      console.log("DB error at Event allEvents", error.message);
      throw new Error(`DB error at User allEvents : ${error.message}`);
    }
  }

  async createdEvents(userId:any) {
    try {
      const events = await eventModel.find({ hostId: userId }).populate('hostId');
      return events;
    } catch (error: any) {
      console.log("DB error at Event allEvents", error.message);
      throw new Error(`DB error at User allEvents : ${error.message}`);
    }
  }
}