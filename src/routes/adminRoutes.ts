import express from "express";
import { adminLogin , userManage, toggleUser } from "../controller/adminController";
import {verifyToken , authorizeRole} from "../middleware/adminAuth"

const router = express.Router()

router.post('/login',adminLogin)
router.get('/user-management',userManage)
router.get('/user-management/:id',toggleUser)





export default router;