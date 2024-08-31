import mongoose,{Schema} from "mongoose";


const commentReportSchema = new Schema({
    users:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'user'
        }],
        default:[]
    },
    commentId:{
        type:Schema.Types.ObjectId,
        ref:'comment',
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

const commentReportModel =  mongoose.model('commentReport',commentReportSchema);


 


export default commentReportModel;