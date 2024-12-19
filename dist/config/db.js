"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    try {
        const url = process.env.MONGO_URL;
        await mongoose_1.default.connect(url);
        console.log("Mongo Db connected");
    }
    catch (err) {
        console.log(err);
    }
};
exports.default = connectDb;
