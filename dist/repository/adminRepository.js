"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const adminSchema_1 = __importDefault(require("../model/adminSchema"));
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
}
exports.AdminRepository = AdminRepository;
