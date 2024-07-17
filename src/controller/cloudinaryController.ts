import { Request, Response } from "express";
import { UserRepository } from "../repository/userRepository";
import { v2 as cloudinary } from "cloudinary";
import connectCloud from "../config/cloudinary";

const userRepo = new UserRepository();

connectCloud();

export const generateSignature = async (req: Request, res: Response) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp: timestamp , upload_preset : process.env.CLOUD_UPLOAD_PRESET},
      process.env.CLOUD_API_SECRET as string
    );
    res.status(200).json({ signature, timestamp , status:'success'});
  } catch (error: any) {
    console.log("Error at generateSignature", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

export const updateDp = async (req: Request, res: Response) => {
  try {
    const {dp,userId} = req.body;
    const data = {
        dp
    }
    const updatedUser = await userRepo.findOneAndUpdate({_id:userId},data)
    res.status(200).json({status:'success',user:updatedUser,message:'Profile Picture updated successfully'})
  } catch (error: any) {
    console.log("Error at updateDp", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const {banner,userId} = req.body;
    const data = {
        banner
    }
    const updatedUser = await userRepo.findOneAndUpdate({_id:userId},data)
    res.status(200).json({status:'success',user:updatedUser,message:'Banner updated successfully'})
  } catch (error: any) {
    console.log("Error at updateBanner", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};