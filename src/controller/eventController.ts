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

// Add new event : /user/events
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