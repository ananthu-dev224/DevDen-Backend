import mongoose,{Schema} from "mongoose";


const savedSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    eventId:{
        type:Schema.Types.ObjectId,
        ref:'event',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})

const savedModel =  mongoose.model('saved',savedSchema);


 
export default savedModel;