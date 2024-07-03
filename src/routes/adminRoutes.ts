import express from "express";
import { adminLogin } from "../controller/adminController";
import {verifyToken , authorizeRole} from "../middleware/adminAuth"

const router = express.Router()

router.post('/login',adminLogin)







export default router