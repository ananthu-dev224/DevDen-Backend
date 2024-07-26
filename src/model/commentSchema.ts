import mongoose,{Schema} from "mongoose";


const commentSchema = new Schema({
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
      likes:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'user'
        }],
        default:[]
      },
      isActive: {
        type: Boolean,
        default:true
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
})

const commentModel =  mongoose.model('comment',commentSchema);


export default commentModel;