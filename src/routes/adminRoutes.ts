import express from "express";
import { adminLogin , userManage } from "../controller/adminController";
import {verifyToken , authorizeRole} from "../middleware/adminAuth"

const router = express.Router()

router.post('/login',adminLogin)
router.get('/user-management',verifyToken,authorizeRole('admin'),userManage)






export default router;