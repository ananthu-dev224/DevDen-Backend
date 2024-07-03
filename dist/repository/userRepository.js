"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const userSchema_1 = __importDefault(require("../model/userSchema"));
class UserRepository {
    async addUser(userData) {
        try {
            const newUser = new userSchema_1.default({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                createdAt: Date.now(),
            });
            const data = await newUser.save();
            return data;
        }
        catch (error) {
            console.log("DB error at addUser", error.message);
            throw new Error(`DB error at addUser : ${error.message}`);
        }
    }
    async findByEmail(email) {
        try {
            const user = await userSchema_1.default.findOne({ email });
            return user;
        }
        catch (error) {
            console.log("DB error at User findByEmail", error.message);
            throw new Error(`DB error at User findByEmail : ${error.message}`);
        }
    }
    async findByUsername(username) {
        try {
            const user = await userSchema_1.default.findOne({ username });
            return user;
        }
        catch (error) {
            console.log("DB error at User findByUsername", error.message);
            throw new Error(`DB error at User findByUsername : ${error.message}`);
        }
    }
    async findById(id) {
        try {
            const user = await userSchema_1.default.findById(id);
            return user;
        }
        catch (error) {
            console.log("DB error at User findById", error.message);
            throw new Error(`DB error at User findById : ${error.message}`);
        }
    }
    async findOneAndUpdate(query, update) {
        try {
            const updatedUser = await userSchema_1.default.findOneAndUpdate(query, update, { new: true });
            return updatedUser;
        }
        catch (error) {
            console.log("DB error at User findById", error.message);
            throw new Error(`DB error at User findById : ${error.message}`);
        }
    }
}
exports.UserRepository = UserRepository;
