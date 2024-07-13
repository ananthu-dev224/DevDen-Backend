"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = express_1.default.Router();
router.post('/login', adminController_1.adminLogin);
router.get('/user-management', adminAuth_1.verifyToken, (0, adminAuth_1.authorizeRole)('admin'), adminController_1.userManage);
router.get('/user-management/:id', adminAuth_1.verifyToken, (0, adminAuth_1.authorizeRole)('admin'), adminController_1.toggleUser);
exports.default = router;
