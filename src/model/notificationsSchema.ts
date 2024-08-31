import mongoose,{Schema} from "mongoose";


const notificationsSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    text:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})

const notificationsModel =  mongoose.model('notification',notificationsSchema);


 
export default notificationsModel;