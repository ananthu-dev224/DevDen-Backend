"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardStati = exports.toggleUser = exports.userManage = exports.adminLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const adminRepository_1 = require("../repository/adminRepository");
const userRepository_1 = require("../repository/userRepository");
const eventRepository_1 = require("../repository/eventRepository");
const ticketRepository_1 = require("../repository/ticketRepository");
const adminRepo = new adminRepository_1.AdminRepository();
const userRepo = new userRepository_1.UserRepository();
const eventRepo = new eventRepository_1.EventRepository();
const ticketRepo = new ticketRepository_1.TicketRepository();
// Admin login : /admin/login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminRepo.findByEmail(email);
        if (!admin) {
            return res
                .status(400)
                .json({
                message: "Unauthorized access. Admins only.",
                status: "error",
            });
        }
        const dbpassword = admin.password;
        const comparePass = await bcrypt_1.default.compare(password, dbpassword);
        if (!comparePass) {
            return res
                .status(400)
                .json({ message: "Password is not correct", status: "error" });
        }
        const token = (0, jwt_1.createToken)(admin._id, "admin");
        res
            .status(200)
            .json({
            message: "Access Success",
            status: "success",
            email: admin.email,
            token,
        });
    }
    catch (error) {
        console.log("Error at adminLogin", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.adminLogin = adminLogin;
// Admin user management : /admin/user-management
const userManage = async (req, res) => {
    try {
        const users = await userRepo.allUsers();
        res.status(200).json({ status: "success", users });
    }
    catch (error) {
        console.log("Error at userManage", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.userManage = userManage;
// Admin user block/unblock : /admin/user-management/:id
const toggleUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await userRepo.findById(id);
        if (!user) {
            return res
                .status(404)
                .json({ status: "error", message: "User not found" });
        }
        await userRepo.findOneAndUpdate({ _id: id }, { isActive: !user.isActive });
        res.status(200).json({ status: "success" });
    }
    catch (error) {
        console.log("Error at toggleUser", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.toggleUser = toggleUser;
// Admin dashboard : /admin/dashboard
const dashboardStati = async (req, res) => {
    try {
        // Dashboard top statistics result
        const users = await userRepo.activeUsers();
        const totalUsersActive = users.length;
        const events = await eventRepo.activeEvents();
        const totalEventsActive = events.length;
        const confirmedTickets = await ticketRepo.confirmedTickets();
        const totalCommission = confirmedTickets.reduce((total, ticket) => total + ticket.totalCost * 0.05, 0);
        // User Joined Graph Stati
        const usersJoinedMonthly = await userRepo.getUsersJoinedMonthly(); // Get users joined each month
        // Commision earned daily Stati graph
        const dailyCommission = await ticketRepo.getDailyCommission(); // Get daily commissions
        res
            .status(200)
            .json({
            status: "success",
            totalUsersActive,
            totalEventsActive,
            totalCommission,
            usersJoinedMonthly,
            dailyCommission,
        });
    }
    catch (error) {
        console.log("Error at userManage", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.dashboardStati = dashboardStati;
