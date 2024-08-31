import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "event",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  ticketId: {
    type: String,
    required: true,
  },
  numberOfTickets: {
    type: Number,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  stripe_sessionId: {
    type: String,
  },
  qrCode: {
    type: String,
  },
  status: {
    type: String,
    default: "Purchased",
  },
});

const ticketModel = mongoose.model("ticket", ticketSchema);

export default ticketModel;