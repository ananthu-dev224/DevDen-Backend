"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRepository = void 0;
const eventSchema_1 = __importDefault(require("../model/eventSchema"));
class EventRepository {
    async addEvent(eventData) {
        try {
            const newEvent = new eventSchema_1.default({
                hostId: eventData.hostId,
                image: eventData.image,
                description: eventData.description,
                date: eventData.date,
                time: eventData.time,
                venue: eventData.venue,
                isFree: eventData.isFree,
                ...(eventData.isFree === false && { totalTickets: eventData.totalTickets, ticketPrice: eventData.ticketPrice }),
            });
            const data = await newEvent.save();
            return data;
        }
        catch (error) {
            console.log("DB error at addEvent", error.message);
            throw new Error(`DB error at addEvent : ${error.message}`);
        }
    }
    async findById(id) {
        try {
            const event = await eventSchema_1.default.findById(id);
            return event;
        }
        catch (error) {
            console.log("DB error at Event findById", error.message);
            throw new Error(`DB error at Event findById : ${error.message}`);
        }
    }
    async findOneAndUpdate(query, update) {
        try {
            const updatedEvent = await eventSchema_1.default.findOneAndUpdate(query, update, { new: true });
            return updatedEvent;
        }
        catch (error) {
            console.log("DB error at Event findOneAndUpdate", error.message);
            throw new Error(`DB error at Event findOneAndUpdate : ${error.message}`);
        }
    }
    async allEvents() {
        try {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const events = await eventSchema_1.default.find({ isActive: true, date: { $gt: today.toISOString() }, isApproved: true }).populate('hostId');
            return events;
        }
        catch (error) {
            console.log("DB error at Event allEvents", error.message);
            throw new Error(`DB error at Event allEvents : ${error.message}`);
        }
    }
    async activeEvents() {
        try {
            const events = await eventSchema_1.default.find({ isActive: true });
            return events;
        }
        catch (error) {
            console.log("DB error at Event activeEvents", error.message);
            throw new Error(`DB error at Event activeEvents : ${error.message}`);
        }
    }
    async createdEvents(userId) {
        try {
            const events = await eventSchema_1.default.find({ hostId: userId, isActive: true }).populate('hostId');
            return events;
        }
        catch (error) {
            console.log("DB error at Event createdEvents", error.message);
            throw new Error(`DB error at Event createdEvents : ${error.message}`);
        }
    }
    async followingEvents(followingIds) {
        try {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const events = await eventSchema_1.default.find({ hostId: { $in: followingIds }, isActive: true, date: { $gt: today.toISOString() }, isApproved: true }).sort({ createdAt: -1 }).populate('hostId');
            return events;
        }
        catch (error) {
            console.log("DB error at Event followingEvents", error.message);
            throw new Error(`DB error at Event followingEvents : ${error.message}`);
        }
    }
    async userEvents(userId) {
        try {
            const events = await eventSchema_1.default.find({ hostId: userId, isActive: true, isApproved: true }).populate('hostId');
            return events;
        }
        catch (error) {
            console.log("DB error at Event createdEvents", error.message);
            throw new Error(`DB error at Event createdEvents : ${error.message}`);
        }
    }
    async adminEvents() {
        try {
            const events = await eventSchema_1.default.find({ isApproved: false }).populate('hostId');
            return events;
        }
        catch (error) {
            console.log("DB error at Event adminEvents", error.message);
            throw new Error(`DB error at Event adminEvents : ${error.message}`);
        }
    }
    async topHosts() {
        try {
            const data = await eventSchema_1.default.aggregate([
                // Group by hostId to count the number of events per user
                {
                    $group: {
                        _id: "$hostId",
                        eventCount: { $sum: 1 }
                    }
                },
                // Sort by event count in descending order
                { $sort: { eventCount: -1 } },
                // Limit to top 5 hosts
                { $limit: 5 },
                // Lookup user details for each host
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                // Unwind the userDetails array to make it a single object
                { $unwind: "$userDetails" },
                // Project the necessary fields
                {
                    $project: {
                        _id: 1,
                        username: "$userDetails.username",
                        dp: "$userDetails.dp",
                        eventCount: 1
                    }
                }
            ]);
            return data;
        }
        catch (error) {
            console.log("DB error at Event topHosts", error.message);
            throw new Error(`DB error at Event topHosts : ${error.message}`);
        }
    }
}
exports.EventRepository = EventRepository;
