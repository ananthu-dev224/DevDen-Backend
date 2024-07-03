"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const router = express_1.default.Router();
router.post('/signup', userController_1.signup);
router.post('/verify-otp', userController_1.verifyOtp);
router.post('/resend-otp', userController_1.resendOtp);
router.post('/login', userController_1.userLogin);
router.post('/forgot-password', userController_1.forgotPassword);
router.get('/validate-reset-token/:token', userController_1.validateResetToken);
router.post('/reset-password', userController_1.resetPassword);
exports.default = router;
