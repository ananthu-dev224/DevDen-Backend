import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  numberOfTickets: {
    type: Number,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: true
  }
});

const ticketModel = mongoose.model('ticket', ticketSchema);

export default ticketModel;
