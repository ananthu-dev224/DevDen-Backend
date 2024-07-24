import { EventRepository } from "../repository/eventRepository";
import { Request, Response } from "express";

const eventRepo = new EventRepository();

// Add new event : /user/create-event
export const addEvent = async (req: Request, res: Response) => {
  try {
    const {
      hostId,
      image,
      description,
      date,
      time,
      venue,
      isFree,
      totalTickets,
      ticketPrice,
    } = req.body;


    const eventDateTime = new Date(`${date}T${time}`);
    const currentDateTime = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000; // Number of milliseconds in one day

    if (eventDateTime.getTime() - currentDateTime.getTime() < oneDayInMillis) {
      return res.status(400).json({
        message: "Event should be created at least a day in advance.",
        status: "error",
      });
    }
    const numericTotalTickets = parseInt(totalTickets, 10);
    const numericTicketPrice = parseFloat(ticketPrice);

    const eventData = {
      hostId,
      image,
      description,
      date,
      time,
      venue,
      isFree,
      totalTickets: numericTotalTickets,
      ticketPrice: numericTicketPrice,
    };
    const newEvent = await eventRepo.addEvent(eventData);
    res.status(200).json({
      message: "Event created successfully",
      status: "success",
      newEvent,
    });
  } catch (error: any) {
    console.log("Error at addEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Get all events : /user/events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventRepo.allEvents();

    const sortedEvents = events.sort((a, b) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });

    res.status(200).json({
      status: "success",
      events: sortedEvents,
    });
  } catch (error: any) {
    console.log("Error at getEvents", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Get specific user created events : /user/event/:userId
export const getCreatedEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const events = await eventRepo.createdEvents(userId);

    const sortedEvents = events.sort((a, b) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });

    res.status(200).json({
      status: "success",
      events: sortedEvents,
    });
  } catch (error: any) {
    console.log("Error at getCreatedEvents", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Abort Event(toggle to no active) : /user/abort-event/:id
export const abortEvent = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const abortedEvent = await eventRepo.findOneAndUpdate({_id},{isActive:false})
    // Do the other ticket refund related logic

    res.status(200).json({
      status: "success",
      event: abortedEvent,
    });
  } catch (error: any) {
    console.log("Error at abortEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Edit Event : /user/edit-event
export const editEvent = async (req: Request, res: Response) => {
  try {
    const {
      eventId,
      hostId,
      image,
      description,
      date,
      time,
      venue,
      isFree,
      totalTickets,
      ticketPrice,
    } = req.body;

    const eventDateTime = new Date(`${date}T${time}`);
    const currentDateTime = new Date();
    const oneDayInMillis = 24 * 60 * 60 * 1000; // Number of milliseconds in one day

    if (eventDateTime.getTime() - currentDateTime.getTime() < oneDayInMillis) {
      return res.status(400).json({
        message: "Event should be created at least a day in advance.",
        status: "error",
      });
    }
    const numericTotalTickets = parseInt(totalTickets, 10);
    const numericTicketPrice = parseFloat(ticketPrice);
    let updateData = {}
    if(!isFree){
      updateData = {
        hostId,
        image,
        description,
        date,
        time,
        venue,
        isFree,
        totalTickets: numericTotalTickets,
        ticketPrice: numericTicketPrice,
      };
    }else{
      updateData = {
        hostId,
        image,
        description,
        date,
        time,
        venue,
        isFree,
      };
    }
    const newEvent = await eventRepo.findOneAndUpdate({_id:eventId},updateData);
    res.status(200).json({
      message: "Event updated successfully",
      status: "success",
      newEvent,
    });
  } catch (error: any) {
    console.log("Error at editEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};


// Get not approved events : /admin/event-portal
export const getAdminEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventRepo.adminEvents();

    const sortedEvents = events.sort((a, b) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });

    res.status(200).json({
      status: "success",
      events: sortedEvents,
    });
  } catch (error: any) {
    console.log("Error at getAdminEvents", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};


// Admin event approve : /admin/approve-event/:id
export const approveEvent =  async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const event = await eventRepo.findById(id);

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
  
    const updatedUser = await eventRepo.findOneAndUpdate(
      { _id: id },
      { isApproved: true }
    );
    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.log("Error at approveEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// event like : /user/like-event
export const likeEvent =  async (req: Request, res: Response) => {
  try {
    const {userId, eventId} = req.body;
    const event = await eventRepo.findById(eventId);

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
  
    let updatedLikes;

    if (event.likes.includes(userId)) {
      updatedLikes = event.likes.filter((id: any) => id !== userId);
    } else {
      updatedLikes = [...event.likes, userId];
    }

    await eventRepo.findOneAndUpdate(
      { _id: eventId },
      { likes: updatedLikes }
    );
    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.log("Error at likeEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};