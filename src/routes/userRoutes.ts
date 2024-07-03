import express from "express";
import { userLogin, signup, verifyOtp, resendOtp, forgotPassword, validateResetToken, resetPassword } from "../controller/userController";
import {verifyToken , authorizeRole} from "../middleware/userAuth"

const router = express.Router()

router.post('/signup',signup)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp',resendOtp)
router.post('/login',userLogin)
router.post('/forgot-password',forgotPassword)
router.get('/validate-reset-token/:token',validateResetToken)
router.post('/reset-password',resetPassword)


export default router