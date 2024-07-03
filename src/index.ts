import  express from "express"
import dotenv from 'dotenv'
import session from "express-session";
import cors from "cors";

import connectDb from "./config/db"
import userRoutes from './routes/userRoutes'
import adminRoutes from './routes/adminRoutes'

import { userPayload, adminPayload } from "./types/types";

dotenv.config()
const app = express()
const port = process.env.PORT


// custom module for session
declare module "express-session" {
    interface Session {
      userData?: {
        username?: string;
        email?: string;
        password?: string;
      };
      otp?: string;
      otpGeneratedTime?: number;
    }
}


// custom module for express-serve-static-core
declare module 'express-serve-static-core' {
    interface Request {
      user?: userPayload; 
      admin?: adminPayload;
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(cors({
  origin:'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

connectDb()

app.use("/user",userRoutes)
app.use("/admin",adminRoutes)





app.listen(port,() => {
    console.log(`Backend server starts at http://127.0.0.1:${port}`)
})