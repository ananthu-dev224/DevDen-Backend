import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chat = mongoose.model("chat", chatSchema);

export default chat;
