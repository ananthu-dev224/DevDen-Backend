"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueTicketId = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ticketRepository_1 = require("../repository/ticketRepository");
const ticketRepo = new ticketRepository_1.TicketRepository();
// Function to generate a unique 6-digit ticket ID
const generateUniqueTicketId = async () => {
    let ticketId = '';
    let isUnique = false;
    while (!isUnique) {
        // Generate a random 6-digit number
        ticketId = crypto_1.default.randomInt(100000, 999999).toString();
        // Check if this ticket ID already exists
        const existingTicket = await ticketRepo.findByTicketId(ticketId);
        if (!existingTicket) {
            isUnique = true;
        }
    }
    return ticketId;
};
exports.generateUniqueTicketId = generateUniqueTicketId;
