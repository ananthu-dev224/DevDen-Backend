"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBanner = exports.updateDp = exports.generateSignature = void 0;
const userRepository_1 = require("../repository/userRepository");
const cloudinary_1 = require("cloudinary");
const cloudinary_2 = __importDefault(require("../config/cloudinary"));
const userRepo = new userRepository_1.UserRepository();
(0, cloudinary_2.default)();
// cloudinary signature : /user/cloud-signature
const generateSignature = async (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary_1.v2.utils.api_sign_request({ timestamp: timestamp, upload_preset: process.env.CLOUD_UPLOAD_PRESET }, process.env.CLOUD_API_SECRET);
        res.status(200).json({ signature, timestamp, status: "success" });
    }
    catch (error) {
        console.log("Error at generateSignature", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.generateSignature = generateSignature;
// Edit profile dp : /user/edit-dp
const updateDp = async (req, res) => {
    try {
        const { dp } = req.body;
        const userId = req.user?.userId;
        const data = {
            dp,
        };
        const updatedUser = await userRepo.findOneAndUpdate({ _id: userId }, data);
        res
            .status(200)
            .json({
            status: "success",
            user: updatedUser,
            message: "Profile Picture updated successfully",
        });
    }
    catch (error) {
        console.log("Error at updateDp", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.updateDp = updateDp;
// Edit profile banner : /user/edit-banner
const updateBanner = async (req, res) => {
    try {
        const { banner } = req.body;
        const userId = req.user?.userId;
        const data = {
            banner,
        };
        const updatedUser = await userRepo.findOneAndUpdate({ _id: userId }, data);
        res
            .status(200)
            .json({
            status: "success",
            user: updatedUser,
            message: "Banner updated successfully",
        });
    }
    catch (error) {
        console.log("Error at updateBanner", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.updateBanner = updateBanner;
