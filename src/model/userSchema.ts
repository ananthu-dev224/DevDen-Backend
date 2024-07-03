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
    image:{
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
    createdAt:{
        type:String,
        default:Date.now()
    }
})

const userModal =  mongoose.model('user',userSchema);


export default userModal;