"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const adminSchema_1 = __importDefault(require("../model/adminSchema"));
const userSchema_1 = __importDefault(require("../model/userSchema"));
class AdminRepository {
    async findByEmail(email) {
        try {
            const admin = await adminSchema_1.default.findOne({ email });
            return admin;
        }
        catch (error) {
            console.log("DB error at Admin findByEmail", error.message);
            throw new Error(`DB error at Admin findByEmail : ${error.message}`);
        }
    }
    async allUsers() {
        try {
            const users = await userSchema_1.default.aggregate([
                {
                    $project: {
                        _id: 0,
                        username: 1,
                        email: 1,
                        isActive: 1,
                        createdAt: 1,
                        image: 1
                    }
                }
            ]);
            return users;
        }
        catch (error) {
            console.log("DB error at Admin allUsers", error.message);
            throw new Error(`DB error at Admin allUsers : ${error.message}`);
        }
    }
}
exports.AdminRepository = AdminRepository;
