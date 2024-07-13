"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.resetPassword = exports.validateResetToken = exports.forgotPassword = exports.userLogin = exports.resendOtp = exports.verifyOtp = exports.signup = void 0;
const otp_generator_1 = __importDefault(require("otp-generator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jwt_1 = require("../utils/jwt");
const mail_1 = require("../utils/mail");
const generateUsername_1 = __importDefault(require("../utils/generateUsername"));
const google_auth_library_1 = require("google-auth-library");
const userRepository_1 = require("../repository/userRepository");
let resetTokens = {};
let otpSend;
let otpTime;
const userRepo = new userRepository_1.UserRepository();
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new google_auth_library_1.OAuth2Client(clientId);
// User signup : /user/signup
const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await userRepo.findByEmail(email);
        if (userExists) {
            return res
                .status(400)
                .json({ message: "Email already registered", status: "error" });
        }
        const usernameExists = await userRepo.findByUsername(username);
        if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists, Please try different",
                status: "error",
            });
        }
        otpSend = otp_generator_1.default.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        req.session.otp = otpSend;
        await (0, mail_1.sendOtpMail)(req, email, username);
        otpTime = Date.now();
        const signupData = {
            username,
            email,
            password,
        };
        res.status(200).json({
            message: "OTP send to your Email",
            signupData,
            status: "success",
        });
    }
    catch (error) {
        console.log("Error at signup", error);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.signup = signup;
// Otp verify : /user/verify-otp
const verifyOtp = async (req, res) => {
    try {
        const { otp, username, email, password } = req.body;
        if (otp !== otpSend) {
            return res.status(400).json({ message: "Invalid OTP", status: "error" });
        }
        const otpGeneratedTime = otpTime || 0;
        const expireOtp = 5 * 60 * 1000; //5 minute in milliseconds
        if (Date.now() - otpGeneratedTime > expireOtp) {
            return res.status(400).json({ message: "OTP Expired", status: "error" });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const userData = {
            email,
            username,
            password: hashedPassword,
        };
        const newUser = await userRepo.addUser(userData);
        const token = (0, jwt_1.createToken)(newUser._id, "user");
        res.status(200).json({
            message: "User Registered Successfully",
            status: "success",
            newUser,
            token,
        });
    }
    catch (error) {
        console.log("Error at verifyOtp", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.verifyOtp = verifyOtp;
// Resend verify : /user/resend-otp
const resendOtp = async (req, res) => {
    try {
        const { email, username } = req.body;
        otpSend = otp_generator_1.default.generate(6, {
            digits: true,
            specialChars: false,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
        });
        req.session.otp = otpSend;
        await (0, mail_1.sendOtpMail)(req, email, username);
        otpTime = Date.now();
        res
            .status(200)
            .json({ message: "OTP Resend Success", email, status: "success" });
    }
    catch (error) {
        console.log("Error at resendOtp", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.resendOtp = resendOtp;
// User login : /user/login
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userRepo.findByEmail(email);
        if (!user) {
            return res
                .status(400)
                .json({ message: "User doesnt exist, Please Signup", status: "error" });
        }
        if (!user.isActive) {
            return res
                .status(400)
                .json({ message: "Your access has been restricted by the admin.", status: "error" });
        }
        const dbpassword = user.password;
        const comparePass = await bcrypt_1.default.compare(password, dbpassword);
        if (!comparePass) {
            return res
                .status(400)
                .json({ message: "Password is not correct", status: "error" });
        }
        const token = (0, jwt_1.createToken)(user._id, "user");
        res
            .status(200)
            .json({ message: "Login Success", status: "success", token, user });
    }
    catch (error) {
        console.log("Error at userLogin", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.userLogin = userLogin;
// User forgot password: /user/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userRepo.findByEmail(email);
        if (!user) {
            return res
                .status(400)
                .json({ message: "Email is not registered.", status: "error" });
        }
        if (user.googleId) {
            return res
                .status(400)
                .json({ message: "Email is google registered, please sign in using google", status: "error" });
        }
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        resetTokens[email] = {
            token: resetToken,
            expires: Date.now() + 3600000, //1hour
        };
        await (0, mail_1.sendResetMail)(req, email, resetToken);
        res.status(200).json({
            message: `Password reset mail send to ${email}`,
            status: "success",
        });
    }
    catch (error) {
        console.log("Error at forgotPassword", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.forgotPassword = forgotPassword;
// User validate reset token : /user/validate-reset-token
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        const userEmail = Object.keys(resetTokens).find((email) => resetTokens[email].token === token);
        if (!userEmail) {
            return res
                .status(400)
                .json({ message: "Invalid or expired reset token" });
        }
        if (resetTokens[userEmail].expires < Date.now()) {
            return res.status(400).json({ message: "Reset token has expired" });
        }
        // Token is valid
        res.status(200).json({ message: "Token is valid.", status: "success" });
    }
    catch (error) {
        console.log("Error at validateResetToken", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.validateResetToken = validateResetToken;
// User reset password : /user/reset-password
const resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;
        const email = Object.keys(resetTokens).find((key) => resetTokens[key].token === token);
        if (!email || resetTokens[email].expires < Date.now()) {
            return res
                .status(400)
                .json({ message: "Password reset token is invalid or has expired" });
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const updatedUser = await userRepo.findOneAndUpdate({ email: email }, { password: hashedPassword });
        delete resetTokens[email];
        res
            .status(200)
            .json({ message: "Password Updated Successfully", status: "success" });
    }
    catch (error) {
        console.log("Error at resetPassword", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.resetPassword = resetPassword;
// User google signin : /user/oauth
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload?.email;
        const name = payload?.name || "";
        const googleId = payload?.sub;
        if (!email || !googleId) {
            return res
                .status(400)
                .json({ message: "Invalid token payload", status: "error" });
        }
        const user = await userRepo.findByEmail(email);
        if (user) {
            if (!user.googleId) { // if already sign up using normal method
                return res
                    .status(400)
                    .json({
                    message: "This email is already registered with normal signup.",
                });
            }
            else if (!user.isActive) { // if restricted
                return res
                    .status(400)
                    .json({
                    message: "Your access has been restricted by the admin.",
                });
            }
            else { // else user already sign up with oauth
                const token = (0, jwt_1.createToken)(user._id, "user");
                return res
                    .status(200)
                    .json({ message: "Login Success", status: "success", token, user });
            }
        }
        else { // new fresh sign up
            const baseUsername = email.split('@')[0];
            const username = await (0, generateUsername_1.default)(baseUsername);
            const userData = {
                email,
                name,
                username,
                googleId
            };
            const newUser = await userRepo.addUser(userData);
            const token = (0, jwt_1.createToken)(newUser._id, "user");
            return res
                .status(200)
                .json({ message: "Login Success", status: "success", token, user: newUser });
        }
    }
    catch (error) {
        console.log("Error at googleAuth", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.googleAuth = googleAuth;
