import express from "express";
import { adminLogin , userManage, toggleUser } from "../controller/adminController";
import {verifyToken , authorizeRole} from "../middleware/adminAuth"

const router = express.Router()

router.post('/login',adminLogin)
router.get('/user-management',verifyToken,authorizeRole('admin'),userManage)
router.get('/user-management/:id',verifyToken,authorizeRole('admin'),toggleUser)










export default router;