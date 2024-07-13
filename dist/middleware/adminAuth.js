"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const verifyToken = async (req, res, next) => {
    console.log("verify token middleware admin auth...");
    const auth_header = req.headers["authorization"];
    if (!auth_header) {
        return res
            .status(400)
            .json({ message: "No token in request", status: "error" });
    }
    const token = auth_header.split(" ")[1];
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log(err);
            err instanceof jsonwebtoken_1.TokenExpiredError
                ? res.status(400).json({ message: "Token expired", status: "error" })
                : res.status(400).json({
                    message: "Failed to authenticate token",
                    status: "error",
                });
        }
        if (!decoded || !decoded.role) {
            return res
                .status(400)
                .json({ message: "Invalid Token Structure", status: "error" });
        }
        req.admin = {
            adminId: decoded.userId,
            role: decoded.role,
        };
        next();
    });
};
exports.verifyToken = verifyToken;
// Checking role admin
const authorizeRole = (requiredRole) => (req, res, next) => {
    console.log("verifying admin role...");
    if (!req.admin || !req.admin.role || !req.admin.role.includes(requiredRole)) {
        return res
            .status(400)
            .json({ message: "Access Denied : Admin Only", status: "error" });
    }
    next();
};
exports.authorizeRole = authorizeRole;
