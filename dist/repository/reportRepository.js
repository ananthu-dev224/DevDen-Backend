"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
const commentReportSchema_1 = __importDefault(require("../model/commentReportSchema"));
const eventReportSchema_1 = __importDefault(require("../model/eventReportSchema"));
class ReportRepository {
    async addEventReport(data) {
        try {
            const res = await eventReportSchema_1.default.findOneAndUpdate({ eventId: data.eventId, reportType: data.reportType }, {
                $inc: { count: 1 }, // Increment the count by 1
                $push: { users: data.userId }, // Add the userId to the users array
            }, { new: true, upsert: true } // Upsert option to create the document if it doesn't exist
            );
            return res;
        }
        catch (error) {
            console.log("DB error at addEventReport", error.message);
            throw new Error(`DB error at addEventReport : ${error.message}`);
        }
    }
    async addCommentReport(data) {
        try {
            const res = await commentReportSchema_1.default.findOneAndUpdate({ commentId: data.commentId, reportType: data.reportType }, {
                $inc: { count: 1 }, // Increment the count by 1
                $push: { users: data.userId }, // Add the userId to the users array
            }, { new: true, upsert: true } // Upsert option to create the document if it doesn't exist
            );
            return res;
        }
        catch (error) {
            console.log("DB error at addCommentReport", error.message);
            throw new Error(`DB error at addCommentReport : ${error.message}`);
        }
    }
    async findEventReport(eventId, reportType, userId) {
        try {
            const report = await eventReportSchema_1.default.findOne({ eventId, reportType, users: { $in: [userId] } });
            return report;
        }
        catch (error) {
            console.log("DB error at Report findEventReport", error.message);
            throw new Error(`DB error at Report findEventReport : ${error.message}`);
        }
    }
    async findCommentReport(commentId, reportType, userId) {
        try {
            const report = await commentReportSchema_1.default.findOne({ commentId, reportType, users: { $in: [userId] } });
            return report;
        }
        catch (error) {
            console.log("DB error at Report findCommentReport", error.message);
            throw new Error(`DB error at Report findCommentReport : ${error.message}`);
        }
    }
    async allEventReports() {
        try {
            const reports = await eventReportSchema_1.default.find().populate('eventId').sort({ count: -1 });
            return reports;
        }
        catch (error) {
            console.log("DB error at Report allEventReports", error.message);
            throw new Error(`DB error at Report allEventReports : ${error.message}`);
        }
    }
    async allCommentReports() {
        try {
            const reports = await commentReportSchema_1.default.find().populate('commentId').sort({ count: -1 });
            return reports;
        }
        catch (error) {
            console.log("DB error at Report allCommentReports", error.message);
            throw new Error(`DB error at Report allCommentReports : ${error.message}`);
        }
    }
}
exports.ReportRepository = ReportRepository;
