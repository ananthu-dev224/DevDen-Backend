import mongoose, { Schema } from "mongoose";

const conversationSchema = new Schema({
    members: {
      type: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
      required: true,
    },
    isGroup:{
      type:Boolean,
      default:false
    },
  },
  { timestamps: true }
);

const conversation = mongoose.model("conversation",conversationSchema);
export default conversation;