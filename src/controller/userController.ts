import { Request, Response } from "express";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { createToken } from "../utils/jwt";
import { sendOtpMail, sendResetMail } from "../utils/mail";
import generateUniqueUsername from "../utils/generateUsername";
import { OAuth2Client } from "google-auth-library";

import { UserRepository } from "../repository/userRepository";

let resetTokens: any = {};
let otpSend: string;
let otpTime: number;
const userRepo = new UserRepository();
const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
// User signup : /user/signup
export const signup = async (req: Request, res: Response) => {
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
    otpSend = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    req.session.otp = otpSend;
    await sendOtpMail(req, email, username);
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
  } catch (error: any) {
    console.log("Error at signup", error);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Otp verify : /user/verify-otp
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp, username, email, password } = req.body;
    if (otp !== otpSend) {
      return res.status(400).json({ message: "Invalid OTP", status: "error" });
    }
    const otpGeneratedTime: any = otpTime || 0;
    const expireOtp = 5 * 60 * 1000; //5 minute in milliseconds
    if (Date.now() - otpGeneratedTime > expireOtp) {
      return res.status(400).json({ message: "OTP Expired", status: "error" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userData = {
      email,
      username,
      password: hashedPassword,
    };
    const newUser = await userRepo.addUser(userData);
    const token = createToken(newUser._id, "user");
    res.status(200).json({
      message: "User Registered Successfully",
      status: "success",
      newUser,
      token,
    });
  } catch (error: any) {
    console.log("Error at verifyOtp", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Resend verify : /user/resend-otp
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email, username } = req.body;
    otpSend = otpGenerator.generate(6, {
      digits: true,
      specialChars: false,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
    });
    req.session.otp = otpSend;
    await sendOtpMail(req, email, username);
    otpTime = Date.now();
    res
      .status(200)
      .json({ message: "OTP Resend Success", email, status: "success" });
  } catch (error: any) {
    console.log("Error at resendOtp", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User login : /user/login
export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User doesnt exist, Please Signup", status: "error" });
    }

    if(!user.isActive){
      return res
      .status(400)
      .json({ message: "Your access has been restricted by the admin.", status: "error" });
    }
    const dbpassword = user.password as string;
    const comparePass = await bcrypt.compare(password, dbpassword);
    if (!comparePass) {
      return res
        .status(400)
        .json({ message: "Password is not correct", status: "error" });
    }
    const token = createToken(user._id, "user");
    res
      .status(200)
      .json({ message: "Login Success", status: "success", token, user });
  } catch (error: any) {
    console.log("Error at userLogin", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User forgot password: /user/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email is not registered.", status: "error" });
    }

    if(user.googleId){
      return res
        .status(400)
        .json({ message: "Email is google registered, please sign in using google", status: "error" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    resetTokens[email] = {
      token: resetToken,
      expires: Date.now() + 3600000, //1hour
    };
    await sendResetMail(req, email, resetToken);
    res.status(200).json({
      message: `Password reset mail send to ${email}`,
      status: "success",
    });
  } catch (error: any) {
    console.log("Error at forgotPassword", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User validate reset token : /user/validate-reset-token
export const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const userEmail = Object.keys(resetTokens).find(
      (email) => resetTokens[email].token === token
    );

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
  } catch (error: any) {
    console.log("Error at validateResetToken", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User reset password : /user/reset-password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password, token } = req.body;
    const email = Object.keys(resetTokens).find(
      (key) => resetTokens[key].token === token
    );

    if (!email || resetTokens[email].expires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userRepo.findOneAndUpdate(
      { email: email },
      { password: hashedPassword }
    );
    delete resetTokens[email];
    res
      .status(200)
      .json({ message: "Password Updated Successfully", status: "success" });
  } catch (error: any) {
    console.log("Error at resetPassword", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User google signin : /user/oauth
export const googleAuth = async (req: Request, res: Response) => {
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
      } else {  // else user already sign up with oauth
        const token = createToken(user._id, "user");
        return res
        .status(200)
        .json({ message: "Login Success", status: "success", token, user });
      }
    } else {  // new fresh sign up
      const baseUsername = email.split('@')[0];
      const username = await generateUniqueUsername(baseUsername)
      const userData = {
        email,
        name,
        username,
        googleId
      };
      const newUser = await userRepo.addUser(userData);
      const token = createToken(newUser._id, "user");
      return res
        .status(200)
        .json({ message: "Login Success", status: "success", token, user:newUser });
    }
  } catch (error: any) {
    console.log("Error at googleAuth", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};


