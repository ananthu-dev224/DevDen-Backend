import mongoose,{Schema} from "mongoose";


const eventReportSchema = new Schema({
    userId:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'user'
        }],
        default:[]
    },
    eventId:{
        type:Schema.Types.ObjectId,
        ref:'event',
        required:true
    },
    reportType:{
       type:String,
       required:true,
    },
    count:{
        type:Number,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})

const eventReportModel =  mongoose.model('eventReport',eventReportSchema);


 


export default eventReportModel;