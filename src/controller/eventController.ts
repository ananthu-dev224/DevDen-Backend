import { EventRepository } from "../repository/eventRepository";
import { TicketRepository } from "../repository/ticketRepository";
import { SavedRepository } from "../repository/savedRepository";
import { UserRepository } from "../repository/userRepository";
import { NotificationsRepository } from "../repository/notificationsRepository";
import { NetworkRepository } from "../repository/networkRepository";
import { Request, Response } from "express";
import mongoose from "mongoose";
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
const savedRepo = new SavedRepository();
const userRepo = new UserRepository();
const notiRepo = new NotificationsRepository();
const netWorkRepo = new NetworkRepository();

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
      hostId: hostObjectId,
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
    const noti = `You posted a new Event.`;
    const notification = {
      userId: hostId,
      noti,
    };
    await notiRepo.addNotification(notification);
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

// Get all events algorithm : /user/events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Please login." });
    }
    const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1
    const pageSize = 2;
    const following = await netWorkRepo.getFollowing(userId);
    let events: any[];
    if (following.length === 0) {
      events = await eventRepo.allEvents();
    } else {
      const followingIds = following.map((user) => user._id);
      events = await eventRepo.followingEvents(followingIds);
    }

    if (events.length === 0) {
      events = await eventRepo.allEvents();
    }

    const sortedEvents = events.sort((a, b) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });

    // Paginate events
    const totalEvents = sortedEvents.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedEvents = sortedEvents.slice(
      startIndex,
      startIndex + pageSize
    );

    res.status(200).json({
      status: "success",
      events: paginatedEvents,
      pagination: {
        page,
        pageSize,
        total: totalEvents,
        totalPages: Math.ceil(totalEvents / pageSize),
      },
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

// explore page : /user/all-events
export const getAllEvents = async (req: Request, res: Response) => {
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
    console.log("Error at getAllEvents", error.message);
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
    await eventRepo.findOneAndUpdate({ _id }, { isActive: false });
    const ticketsToRefund = await ticketRepo.findByEventIdAbort(_id);
    if (!ticketsToRefund.length) {
      return res.status(200).json({
        status: "success",
        message:
          "Event aborted successfully, No tickets found for this event to refund",
      });
    }

    let totalDebitAmount = 0;

    //ticket refund related logic , Refund tickets concurrently
    await Promise.all(
      ticketsToRefund.map(async (ticket) => {
        const sessionId = ticket.stripe_sessionId;
        if (!sessionId) {
          throw new Error(
            `No Stripe session ID found for ticket ${ticket.ticketId}`
          );
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
        if (refund.status !== "succeeded") {
          throw new Error(
            `Refund failed for payment intent ${paymentIntentId}`
          );
        } else {
          const commissionRate = 0.05; // 5% commission
          const ticketCost = ticket.totalCost;
          const commissionAmount = ticketCost * commissionRate;
          const debitAmount = ticketCost - commissionAmount;

          totalDebitAmount += debitAmount;
          const refundNoti = `Event Aborted by host, Ticket ID ${ticket.ticketId} of cost $${ticket.totalCost} refund to stripe done.`;
          const notification = {
            userId: ticket.userId,
            noti: refundNoti,
          };

          ticketRepo.findOneAndUpdate(
            { ticketId: ticket.ticketId },
            { status: "Aborted" }
          ),
            notiRepo.addNotification(notification);
        }
      })
    );
    // Update host's payment history
    const paymentHistoryEntry = `Debit $${-totalDebitAmount} from your wallet, Event ${
      event._id
    } aborted , ticket refund on ${new Date().toLocaleDateString()}`;
    await userRepo.findOneAndUpdate(
      { _id: event.hostId },
      {
        $inc: { wallet: -totalDebitAmount },
        $push: { paymentHistory: paymentHistoryEntry },
      }
    );

    res.status(200).json({
      status: "success",
      message: "Event aborted and tickets refunded successfully.",
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
    let updateData = {};
    if (!isFree) {
      updateData = {
        hostId: hostObjectId,
        image,
        description,
        date,
        time,
        venue,
        isFree,
        totalTickets: numericTotalTickets,
        ticketPrice: numericTicketPrice,
      };
    } else {
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
    const newEvent = await eventRepo.findOneAndUpdate(
      { _id: eventId },
      updateData
    );
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
export const approveEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const event = await eventRepo.findById(id);

    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }

    const hostId = event.hostId;
    const hostNoti = `Your Event(${id}) approved by admin and is live!`;
    const notification = {
      userId: hostId,
      noti: hostNoti,
    };
    await Promise.all([
      eventRepo.findOneAndUpdate({ _id: id }, { isApproved: true }),
      notiRepo.addNotification(notification),
    ]);
    res.status(200).json({ status: "success" });
  } catch (error: any) {
    console.log("Error at approveEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// event like : /user/like-event
export const likeEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    const event = await eventRepo.findById(eventId);
    const userId = req.user?.userId;
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    if (!userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Please login." });
    }

    const user = await userRepo.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Please login." });
    }

    if (!event) {
      return res
        .status(404)
        .json({ status: "error", message: "Event not found" });
    }
    const hostId = event.hostId;
    let hostNoti;
    let updatedLikes;
    if (event.likes.includes(userIdObjectId)) {
      updatedLikes = event.likes.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(userIdObjectId)
      );
      hostNoti = `Your Event(${eventId}) unliked by ${user.username}`;
    } else {
      updatedLikes = [...event.likes, userIdObjectId];
      hostNoti = `Your Event(${eventId}) liked by ${user.username}`;
    }

    const notification = {
      userId: hostId,
      noti: hostNoti,
    };

    await Promise.all([
      eventRepo.findOneAndUpdate({ _id: eventId }, { likes: updatedLikes }),
      notiRepo.addNotification(notification),
    ]);
    res.status(200).json({ status: "success" });
  } catch (error: any) {
    console.log("Error at likeEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// event save/unsave : POST => /user/save-event
export const saveEvent = async (req: Request, res: Response) => {
  const { eventId } = req.body;
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(404).json({ status: "error", message: "Please login." });
  }
  const userObjectId = new mongoose.Types.ObjectId(userId);
  try {
    const existing = await savedRepo.findOne(userId, eventId);
    if (existing) {
      await savedRepo.findByIdAndDelete(existing._id);
      return res
        .status(200)
        .json({ status: "success", message: "Event unsaved" });
    }
    const saveData = {
      userId: userObjectId,
      eventId,
    };
    const saved = await savedRepo.addToSave(saveData);
    res.status(200).json({ status: "success", message: "Event saved" });
  } catch (error: any) {
    console.log("Error at saveEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// event check saved or not : GET => /user/save-event
export const isSaved = async (req: Request, res: Response) => {
  const { eventId } = req.query;
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(404).json({ status: "error", message: "Please login." });
  }
  try {
    const saved = await savedRepo.findOne(userId, eventId);
    res.status(200).json({ status: "success", isSaved: !!saved });
  } catch (error: any) {
    console.log("Error at isSaved", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// user saved events :  /user/saved
export const userSaved = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(404).json({ status: "error", message: "Please login." });
  }
  try {
    const saved = await savedRepo.findByUserId(userId);
    const sortedEvents = saved.sort((a, b) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });
    res.status(200).json({ status: "success", saved: sortedEvents });
  } catch (error: any) {
    console.log("Error at userSaved", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};