import { EventRepository } from "../repository/eventRepository";
import { TicketRepository } from "../repository/ticketRepository";
import { Request, Response } from "express";
import mongoose from 'mongoose'; 
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET environment variable is not set");
}
const stripe = new Stripe(stripeSecret);

const eventRepo = new EventRepository();
const ticketRepo = new TicketRepository();


// Add new event : /user/create-event
export const addEvent = async (req: Request, res: Response) => {
  try {
    const {
      image,
      description,
      date,
      time,
      venue,
      isFree,
      totalTickets,
      ticketPrice,
    } = req.body;

    const hostId = req.user?.userId;
    const hostObjectId = new mongoose.Types.ObjectId(hostId);

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
      hostId:hostObjectId,
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
    const event = await eventRepo.findById(_id);
    if (!event) {
      return res
        .status(400)
        .json({ status: "error", message: "Event doesnt exist" });
    }
    const eventDate = new Date(event.date);
    // Format event date to YYYY-MM-DD
    const eventDateString = eventDate.toISOString().split("T")[0];
    // Get the current date and format it to YYYY-MM-DD
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0];

    if (eventDateString <= currentDateString) {
      return res.status(400).json({
        status: "error",
        message:
          "Cannot abort event, The event date has already passed or its today",
      });
    }
    await eventRepo.findOneAndUpdate({_id},{isActive:false})
    const ticketsToRefund = await ticketRepo.findByEventId(_id)
    if (!ticketsToRefund.length) {
      return res.status(200).json({ status: 'success', message: 'Event aborted successfully, No tickets found for this event to refund' });
    }

    //ticket refund related logic , Refund tickets concurrently
    await Promise.all(ticketsToRefund.map(async (ticket) => {
      const sessionId = ticket.stripe_sessionId;
      if (!sessionId) {
        throw new Error(`No Stripe session ID found for ticket ${ticket.ticketId}`);
      }

      // Retrieve the payment intent associated with the session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paymentIntentId = session.payment_intent as string;

      if (!paymentIntentId) {
        throw new Error(`No payment intent found for session ${sessionId}`);
      }

      // Create a refund for the payment intent
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      // Check if the refund was successful
      if (refund.status !== 'succeeded') {
        throw new Error(`Refund failed for payment intent ${paymentIntentId}`);
      }else {
          ticketRepo.findOneAndUpdate(
            { ticketId : ticket.ticketId },
            { status: "Aborted" }
          )
      }
    }));
    res.status(200).json({
      status: "success",
      message: "Event aborted and tickets refunded successfully."
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
      image,
      description,
      date,
      time,
      venue,
      isFree,
      totalTickets,
      ticketPrice,
    } = req.body;

    const hostId = req.user?.userId;
    const hostObjectId = new mongoose.Types.ObjectId(hostId);
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
        hostId:hostObjectId,
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
    const {eventId} = req.body;
    const event = await eventRepo.findById(eventId);
    const userId = req.user?.userId;
    const userIdObjectId = new mongoose.Types.ObjectId(userId)

    if(!userId){
      return res.status(404).json({ status: 'error', message: 'Please login.' });
    }

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
  
    let updatedLikes;
    if (event.likes.includes(userIdObjectId)) {
      updatedLikes = event.likes.filter((id: mongoose.Types.ObjectId) => !id.equals(userIdObjectId));
    } else {
      updatedLikes = [...event.likes, userIdObjectId];
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