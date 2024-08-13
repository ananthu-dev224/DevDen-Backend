import { Request, Response } from "express";
import { TicketRepository } from "../repository/ticketRepository";
import { EventRepository } from "../repository/eventRepository";
import { generateUniqueTicketId } from "../utils/generateTicketId";
import Stripe from "stripe";
import mongoose from "mongoose";
import dotenv from "dotenv";
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET environment variable is not set");
}
const stripe = new Stripe(stripeSecret);

const ticketRepo = new TicketRepository();
const eventRepo = new EventRepository();

// checkout session of stripe : /user/checkout-session
export const checkoutSession = async (req: Request, res: Response) => {
  const { amount, quantity, eventImg, eventId } = req.body;
  try {
    const event = await eventRepo.findById(eventId);
    if (!event) {
      return res
        .status(400)
        .json({ status: "error", message: "Event doesnt exist" });
    }
    if (event.totalTickets && event.totalTickets < quantity) {
      return res.status(400).json({
        status: "error",
        message: "Ticket stock is less than chosen quantity.",
      });
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
          "Cant buy tickets, The event date has already passed or its today",
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Event Ticket",
              images: [eventImg],
            },
            unit_amount: amount,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONT_END_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_END_URL}/payment-failure?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        eventId,
        quantity: quantity.toString(),
        amount: amount.toString(),
      },
    });

    res.status(200).json({ id: session.id, status: "success" });
  } catch (error: any) {
    console.log("Error at checkoutSession", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// buyTicket : /user/ticket
export const buyTicket = async (req: Request, res: Response) => {
  const { sessionId, method } = req.body;
  try {
    const userId = req.user?.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    if (!userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Please login." });
    }
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const { metadata } = session;

      // Check if metadata is available
      if (!metadata) {
        return res
          .status(400)
          .json({ status: "error", message: "Payment error: No metadata." });
      }

      // Check if the ticket has already been purchased
      const existingTicket = await ticketRepo.findByStripeId(sessionId);
      if (existingTicket) {
        return res.status(400).json({
          status: "error",
          message: "Ticket already purchased. Please pay again to get more.",
        });
      }

      // Extract event and quantity from metadata
      const eventId = new mongoose.Types.ObjectId(metadata.eventId);
      const quantity = parseInt(metadata.quantity, 10);
      const totalCost = (parseFloat(metadata.amount) / 100) * quantity;

      // Get event details and calculate tickets left
      const event = await eventRepo.findById(eventId);

      if (!event) {
        return res.status(400).json({
          status: "error",
          message: "Event not available. ",
        });
      }

      const ticketsLeft = (event?.totalTickets ?? 0) - quantity;


      const ticketId = await generateUniqueTicketId();
      const qrCodeData = `${process.env.FRONT_END_URL}/ticket-status?ticketId=${ticketId}`;
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

      // Prepare ticket data and save to database
      const ticketData = {
        eventId,
        userId: userObjectId,
        quantity,
        totalCost,
        sessionId,
        method,
        ticketId,
        qrCode:qrCodeUrl
      };

      await Promise.all([
        ticketRepo.addTicket(ticketData),
        eventRepo.findOneAndUpdate(
          { _id: eventId },
          { totalTickets: ticketsLeft }
        ),
      ]);
      return res
        .status(200)
        .json({ status: "success", message: "Ticket purchased successfully" });
  } catch (error: any) {
    console.log("Error at buyTicket", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User tickets : /user/my-tickets
export const userTickets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res
        .status(404)
        .json({ status: "error", message: "Please login." });
    }
    const tickets = await ticketRepo.findByUserId(userId);
    const sortedTickets = tickets.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
    res.status(200).json({ status: "success", tickets: sortedTickets });
  } catch (error: any) {
    console.log("Error at userTickets", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User tickets : /user/event-details/:id
export const eventDetails = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    if (!eventId) {
      return res
        .status(404)
        .json({ status: "error", message: "Event id is required." });
    }
    const details = await ticketRepo.findByEventId(eventId);
    res.status(200).json({ status: "success", details });
  } catch (error: any) {
    console.log("Error at eventDetails", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// cancel ticket and refund : /user/cancel-ticket
export const cancelTicket = async (req: Request, res: Response) => {
  try {
     const { ticketId } = req.body;
    const ticket = await ticketRepo.findByTicketId(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ status: 'error', message: 'Invalid Ticket' });
    }
    const event = await eventRepo.findById(ticket.eventId);
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
          "Cannot cancel ticket, The event date has already passed or its today",
      });
    }
    const sessionId = ticket.stripe_sessionId;

    if (!sessionId) {
      return res.status(400).json({ status: 'error', message: 'No Stripe session ID found' });
    }

    // Retrieve the payment intent associated with the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      return res.status(400).json({ status: 'error', message: 'No payment intent found' });
    }

    // Create a refund for the payment intent
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    if(refund.status === 'succeeded'){
      await Promise.all([
        ticketRepo.findOneAndUpdate(
          { ticketId },
          { status: "Cancelled" }
        ),
        eventRepo.findOneAndUpdate(
          { _id: ticket.eventId },
          { $inc: { totalTickets: ticket.numberOfTickets } }
        )
      ]);
    }

    res.status(200).json({ status: 'success', message: 'Ticket canceled and refunded' });
  } catch (error: any) {
    console.log("Error at cancelTicket", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Download Ticket as PDF : /user/download-ticket/:ticketId
export const downloadTicketPDF = async (req: Request, res: Response) => {
  const ticketId = req.params.id;
  try {
    const ticket:any = await ticketRepo.findByTicketId(ticketId);
    if (!ticket) {
      return res.status(404).json({ status: "error", message: "Ticket not found." });
    }

    // Create a PDF document
    const doc = new PDFDocument();


    // Set PDF headers
    res.setHeader('Content-disposition', `attachment; filename=DevDen Ticket-${ticket.ticketId}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    // Pipe PDF document to response
    doc.pipe(res);

    // Add Title
    doc.fontSize(20).text('Event Ticket', { align: 'center' });
    doc.moveDown();


    // Define dimensions
    const pageWidth = doc.page.width;
    const qrCodeSize = 100; // Size of QR code
    const padding = 20; // Padding between details and QR code

    // Define the X position for QR code
    const qrCodeX = pageWidth - qrCodeSize - padding;
    
    // Define Y positions for details and QR code
    let detailsY = 100;
  

    // Add Ticket Details
    doc.fontSize(12);
    
    const details = [
      `Ticket ID: ${ticket.ticketId}`,
      `Admit: ${ticket.numberOfTickets}`,
      `Hosted by: @${ticket.eventId.hostId.username}`,
      `Total Cost: $${ticket.totalCost}`,
      `Event Venue: ${ticket.eventId.venue}`,
      `Event Date: ${ticket.eventId.date}`,
      `Event Time: ${ticket.eventId.time}`,
      `Status: ${ticket.status}`
    ];

    // Calculate maximum width for text and add ticket details
    details.forEach((line) => {
      doc.text(line, { continued: false });
      detailsY = doc.y; // Update Y position after each line
    });

    // Add QR Code
    if (ticket.qrCode) {
      doc.image(ticket.qrCode, qrCodeX, 100, { fit: [qrCodeSize, qrCodeSize] });
    }


    // Finalize PDF and send
    doc.end();

  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error." });
  }
}