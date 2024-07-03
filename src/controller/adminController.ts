import {Request, Response } from "express";
import bcrypt from "bcrypt"
import { createToken } from "../utils/jwt";
import { AdminRepository } from "../repository/adminRepository";

const adminRepo = new AdminRepository()

// Admin login : /admin/login
export const adminLogin = async (req: Request, res: Response) => {
    try {
      const {email,password} : {email:string, password:string} = req.body;
      const admin = await adminRepo.findByEmail(email)
      if(!admin){
        return res.status(400).json({message:'Unauthorized access. Admins only.',status:'error'})
      }
      const dbpassword = admin.password as string;
      const comparePass = await bcrypt.compare(password,dbpassword);
      if(!comparePass){
        return res.status(400).json({message:'Password is not correct',status:'error'})
      }
      const token = createToken(admin._id,"admin")
      res.status(200).json({message:'Access Success',status:'success',email:admin.email,token})
    } catch (error: any) {
      console.log("Error at adminLogin", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
  };
  

