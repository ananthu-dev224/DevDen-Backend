import mongoose,{ ObjectId } from "mongoose"

export interface userData {
    username:String,
    email:String,
    password?:String,
    name?:String,
    googleId?:String
}

export interface eventData {
    hostId:mongoose.Types.ObjectId,
    image:String,
    description:String,
    date:String,
    time:String,
    venue:String,
    isFree:Boolean,
    totalTickets?:Number,
    ticketPrice?:Number,
}

export interface userPayload {
    userId:string,
    role:String
}

export interface adminPayload {
    adminId?: string,
    role?: string
}