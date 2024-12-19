"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopHosts = exports.editProfile = void 0;
const userRepository_1 = require("../repository/userRepository");
const eventRepository_1 = require("../repository/eventRepository");
const userRepo = new userRepository_1.UserRepository();
const eventRepo = new eventRepository_1.EventRepository();
// Edit profile : /user/edit-profile
const editProfile = async (req, res) => {
    try {
        const { username, name, contact, place, about, website } = req.body;
        const _id = req.user?.userId;
        if (username !== "") {
            const existingUser = await userRepo.findByUsername(username);
            if (existingUser && existingUser._id.toString() !== _id) {
                return res
                    .status(400)
                    .json({ message: "Username already exists", status: "error" });
            }
        }
        const updateData = {};
        // Only include fields that are not empty strings
        if (username !== "")
            updateData.username = username;
        if (name !== "")
            updateData.name = name;
        updateData.contact = contact;
        updateData.place = place;
        updateData.about = about;
        updateData.website = website;
        if (Object.keys(updateData).length > 0) {
            const updatedUser = await userRepo.findOneAndUpdate({ _id }, updateData);
            if (updatedUser) {
                return res.status(200).json({ status: "updated", user: updatedUser });
            }
            else {
                return res
                    .status(404)
                    .json({ message: "User not found", status: "error" });
            }
        }
        else {
            return res
                .status(400)
                .json({ message: "No valid data to update", status: "error" });
        }
    }
    catch (error) {
        console.log("Error at editProfile", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.editProfile = editProfile;
const getTopHosts = async (req, res) => {
    try {
        const data = await eventRepo.topHosts();
        return res
            .status(200)
            .json({ data, status: "success" });
    }
    catch (error) {
        console.log("Error at getTopHosts", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.getTopHosts = getTopHosts;
