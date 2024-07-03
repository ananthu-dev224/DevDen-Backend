import mongoose,{Schema} from "mongoose";


const adminSchema = new Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
    createdAt:{
        type:String,
        default:Date.now()
    }
})

const adminModel =  mongoose.model('admin',adminSchema);


export default adminModel;