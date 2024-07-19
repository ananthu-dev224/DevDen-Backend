import express from "express";
import { userLogin, signup, verifyOtp, resendOtp, forgotPassword, validateResetToken, resetPassword, googleAuth } from "../controller/userController";
import { editProfile } from "../controller/profileController";
import { generateSignature, updateBanner, updateDp} from "../controller/cloudinaryController";
import { addEvent , getEvents} from "../controller/eventController";
import {verifyToken , authorizeRole} from "../middleware/userAuth"

const router = express.Router()

router.post('/signup',signup)
router.post('/verify-otp',verifyOtp)
router.post('/resend-otp',resendOtp)
router.post('/login',userLogin)
router.post('/forgot-password',forgotPassword)
router.get('/validate-reset-token/:token',validateResetToken)
router.post('/reset-password',resetPassword)
router.post('/oauth',googleAuth)
router.post('/edit-profile',verifyToken,authorizeRole('user'),editProfile)
router.get('/cloud-signature',verifyToken,authorizeRole('user'),generateSignature)
router.post('/edit-dp',verifyToken,authorizeRole('user'),updateDp)
router.post('/edit-banner',verifyToken,authorizeRole('user'),updateBanner)
router.post('/create-event',verifyToken,authorizeRole('user'),addEvent)
router.get('/events',verifyToken,authorizeRole('user'),getEvents)


export default router;