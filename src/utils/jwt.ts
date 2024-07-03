import jwt from "jsonwebtoken";
import { userPayload } from "../types/types";




export const createToken = (userId:any,role:string) => {
     const userIdStr = userId.toString();
     const payload : userPayload = {
         userId:userIdStr,
         role
     }
     const token = jwt.sign(payload,process.env.JWT_SECRET as string,{expiresIn : '2d'})
     return token;
}