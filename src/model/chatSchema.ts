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
    replyTo: {
      type: mongoose.Types.ObjectId,
      ref: "chat",
      default: null,
    },
    text: {
      type: String, //chat text-urls
      required: true,
    },
    content: {
      type: String,
      default: "word", //word-image-video-audio
    },
    readBy: {
      type: [{ type: mongoose.Types.ObjectId, ref: "user" }],
      default: [],
    },
  },
  { timestamps: true }
);

const chat = mongoose.model("chat", chatSchema);

export default chat;