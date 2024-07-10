"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userManage = exports.adminLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const adminRepository_1 = require("../repository/adminRepository");
const adminRepo = new adminRepository_1.AdminRepository();
// Admin login : /admin/login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await adminRepo.findByEmail(email);
        if (!admin) {
            return res.status(400).json({ message: 'Unauthorized access. Admins only.', status: 'error' });
        }
        const dbpassword = admin.password;
        const comparePass = await bcrypt_1.default.compare(password, dbpassword);
        if (!comparePass) {
            return res.status(400).json({ message: 'Password is not correct', status: 'error' });
        }
        const token = (0, jwt_1.createToken)(admin._id, "admin");
        res.status(200).json({ message: 'Access Success', status: 'success', email: admin.email, token });
    }
    catch (error) {
        console.log("Error at adminLogin", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.adminLogin = adminLogin;
// Admin user management : /admin/users
const userManage = async (req, res) => {
    try {
        const users = await adminRepo.allUsers();
        res.status(200).json({ status: 'success', users });
    }
    catch (error) {
        console.log("Error at userManage", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.userManage = userManage;
