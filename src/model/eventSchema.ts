import mongoose,{Schema} from "mongoose";


const eventSchema = new Schema({
    hostId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    venue:{
        type:String,
        required:true
    },
    isFree:{
        type:Boolean,
        required:true
    },
    totalTickets:{
        type:Number
    },
    ticketPrice:{
        type:Number
    },
    likes:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'user'
        }],
        default:[]
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})

const eventModel =  mongoose.model('event',eventSchema);


export default eventModel;