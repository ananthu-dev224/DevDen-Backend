import mongoose,{Schema} from "mongoose";


const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
    name:{
        type:String
    },
    dp:{
        type:String
    },
    banner:{
        type:String
    },
    about:{
        type:String
    },
    website:{
        type:String
    },
    contact:{
        type:Number
    },
    place:{
        type:String
    },
    isActive:{
        type:Boolean,
        default:true
    },
    chatStatus:{
        type:String,
        default: 'Offline'
    },
    lastSeen:{
        type:Date,
        default: Date.now
    },
    googleId:{
        type:String
    },
    createdAt:{
        type:String,
        default:Date.now()
    },
})

const userModel =  mongoose.model('user',userSchema);


export default userModel;