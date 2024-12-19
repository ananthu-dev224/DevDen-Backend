"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketRepository = void 0;
const ticketSchema_1 = __importDefault(require("../model/ticketSchema"));
class TicketRepository {
    async addTicket(ticketData) {
        try {
            const newTicket = new ticketSchema_1.default({
                eventId: ticketData.eventId,
                userId: ticketData.userId,
                ticketId: ticketData.ticketId,
                numberOfTickets: ticketData.quantity,
                paymentMethod: ticketData.method,
                totalCost: ticketData.totalCost,
                qrCode: ticketData.qrCode,
                ...(ticketData.sessionId !== null && { stripe_sessionId: ticketData.sessionId })
            });
            const data = await newTicket.save();
            return data;
        }
        catch (error) {
            console.log("DB error at addTicket", error.message);
            throw new Error(`DB error at addTicket : ${error.message}`);
        }
    }
    async findById(id) {
        try {
            const ticket = await ticketSchema_1.default.findById(id);
            return ticket;
        }
        catch (error) {
            console.log("DB error at Ticket findById", error.message);
            throw new Error(`DB error at Ticket findById : ${error.message}`);
        }
    }
    async findOneAndUpdate(query, update) {
        try {
            const updatedTicket = await ticketSchema_1.default.findOneAndUpdate(query, update, { new: true });
            return updatedTicket;
        }
        catch (error) {
            console.log("DB error at Ticket findOneAndUpdate", error.message);
            throw new Error(`DB error at Ticket findOneAndUpdate : ${error.message}`);
        }
    }
    async findByEventId(eventId) {
        try {
            const tickets = await ticketSchema_1.default.find({ eventId: eventId }).populate('eventId').populate('userId');
            return tickets;
        }
        catch (error) {
            console.log("DB error at Ticket findByEventId", error.message);
            throw new Error(`DB error at Ticket findByEventId : ${error.message}`);
        }
    }
    async findByEventIdAbort(eventId) {
        try {
            const tickets = await ticketSchema_1.default.find({ eventId: eventId, status: 'Purchased' }).populate('eventId').populate('userId');
            return tickets;
        }
        catch (error) {
            console.log("DB error at Ticket findByEventIdAbort", error.message);
            throw new Error(`DB error at Ticket findByEventIdAbort : ${error.message}`);
        }
    }
    async findByTicketId(ticketId) {
        try {
            const tickets = await ticketSchema_1.default.findOne({ ticketId: ticketId }).populate({
                path: 'eventId',
                populate: {
                    path: 'hostId',
                    select: 'username email'
                }
            }).populate('userId');
            return tickets;
        }
        catch (error) {
            console.log("DB error at Ticket findByTicketId", error.message);
            throw new Error(`DB error at Ticket findByTicketId : ${error.message}`);
        }
    }
    async findByUserId(userId) {
        try {
            const ticket = await ticketSchema_1.default
                .find({ userId: userId })
                .populate({
                path: 'eventId',
                populate: {
                    path: 'hostId',
                    select: 'username email'
                }
            })
                .populate('userId');
            return ticket;
        }
        catch (error) {
            console.log("DB error at Ticket findByUserId", error.message);
            throw new Error(`DB error at Ticket findByUserId : ${error.message}`);
        }
    }
    async findByStripeId(sessionId) {
        try {
            const ticket = await ticketSchema_1.default.findOne({ stripe_sessionId: sessionId }).populate('eventId').populate('userId');
            return ticket;
        }
        catch (error) {
            console.log("DB error at Ticket findByStripeId", error.message);
            throw new Error(`DB error at Ticket findByStripeId : ${error.message}`);
        }
    }
    async confirmedTickets() {
        try {
            const tickets = await ticketSchema_1.default.find({ status: 'Purchased' });
            return tickets;
        }
        catch (error) {
            console.log("DB error at Ticket confirmedTickets", error.message);
            throw new Error(`DB error at Ticket confirmedTickets : ${error.message}`);
        }
    }
    async getDailyCommission() {
        try {
            const result = await ticketSchema_1.default.aggregate([
                {
                    $match: { status: "Purchased" }
                },
                {
                    $project: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } },
                        commission: { $multiply: ["$totalCost", 0.05] }
                    }
                },
                {
                    $group: {
                        _id: "$date",
                        totalCommission: { $sum: "$commission" }
                    }
                },
                {
                    $sort: { "_id": 1 }
                }
            ]);
            // Fill missing days with 0 
            const dailyData = Array(7).fill(0);
            result.forEach((item) => {
                const dayIndex = new Date(item._id).getDay();
                dailyData[dayIndex] = item.totalCommission;
            });
            return dailyData;
        }
        catch (error) {
            console.log("DB error at Ticket getDailyCommission", error.message);
            throw new Error(`DB error at Ticket getDailyCommission : ${error.message}`);
        }
    }
}
exports.TicketRepository = TicketRepository;
