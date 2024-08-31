import {Request, Response } from "express";
import bcrypt from "bcrypt"
import { createToken } from "../utils/jwt";
import { AdminRepository } from "../repository/adminRepository";
import { UserRepository } from "../repository/userRepository";
import { EventRepository } from "../repository/eventRepository";
import { TicketRepository } from "../repository/ticketRepository";

const adminRepo = new AdminRepository()
const userRepo = new UserRepository()
const eventRepo = new EventRepository()
const ticketRepo = new TicketRepository()

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
  
// Admin user management : /admin/user-management
export const userManage =  async (req: Request, res: Response) => {
  try {
    const users = await userRepo.allUsers()
    res.status(200).json({status:'success',users})
  } catch (error: any) {
    console.log("Error at userManage", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Admin user block/unblock : /admin/user-management/:id
export const toggleUser =  async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await userRepo.findById(id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
  
    await userRepo.findOneAndUpdate(
      { _id: id },
      { isActive: !user.isActive }
    );
    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.log("Error at toggleUser", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Admin dashboard : /admin/dashboard
export const dashboardStati =  async (req: Request, res: Response) => {
  try {
    // Dashboard top statistics result
    const users = await userRepo.activeUsers()
    const totalUsersActive = users.length;
    const events = await eventRepo.activeEvents();
    const totalEventsActive = events.length;
    const confirmedTickets = await ticketRepo.confirmedTickets();
    const totalCommission = confirmedTickets.reduce((total, ticket) => total + (ticket.totalCost * 0.05), 0);
    // User Joined Graph Stati
    const usersJoinedMonthly = await userRepo.getUsersJoinedMonthly(); // Get users joined each month
    // Commision earned daily Stati graph
    const dailyCommission = await ticketRepo.getDailyCommission(); // Get daily commissions
 
    res.status(200).json({status:'success',totalUsersActive,totalEventsActive,totalCommission,usersJoinedMonthly,dailyCommission})
  } catch (error: any) {
    console.log("Error at userManage", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

