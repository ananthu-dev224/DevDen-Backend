"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleComment = exports.toggleEvent = exports.reportedComments = exports.reportedEvents = exports.reportEvent = exports.reportComment = void 0;
const reportRepository_1 = require("../repository/reportRepository");
const commentRepository_1 = require("../repository/commentRepository");
const eventRepository_1 = require("../repository/eventRepository");
const reportRepo = new reportRepository_1.ReportRepository();
const commentRepo = new commentRepository_1.CommentRepository();
const eventRepo = new eventRepository_1.EventRepository();
// report comment : /user/report-comment
const reportComment = async (req, res) => {
    try {
        const { id, type } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(404)
                .json({ status: "error", message: "Please login." });
        }
        const existingReport = await reportRepo.findCommentReport(id, type, userId);
        if (existingReport) {
            return res
                .status(400)
                .json({
                status: "error",
                message: "You have already reported this comment.",
            });
        }
        const data = {
            userId,
            commentId: id,
            reportType: type,
        };
        const newReport = await reportRepo.addCommentReport(data);
        res.status(200).json({ status: "success", newReport });
    }
    catch (error) {
        console.log("Error at reportComment", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.reportComment = reportComment;
// report event : /user/report-event
const reportEvent = async (req, res) => {
    try {
        const { id, type } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res
                .status(404)
                .json({ status: "error", message: "Please login." });
        }
        const existingReport = await reportRepo.findEventReport(id, type, userId);
        if (existingReport) {
            return res
                .status(400)
                .json({
                status: "error",
                message: "You have already reported this event.",
            });
        }
        const data = {
            userId,
            eventId: id,
            reportType: type,
        };
        const newReport = await reportRepo.addEventReport(data);
        res.status(200).json({ status: "success", newReport });
    }
    catch (error) {
        console.log("Error at reportEvent", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.reportEvent = reportEvent;
// reported events admin : /admin/event-reports
const reportedEvents = async (req, res) => {
    try {
        const reports = await reportRepo.allEventReports();
        res.status(200).json({ status: "success", events: reports });
    }
    catch (error) {
        console.log("Error at reportedEvents", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.reportedEvents = reportedEvents;
// reported comments admin : /admin/comment-reports
const reportedComments = async (req, res) => {
    try {
        const reports = await reportRepo.allCommentReports();
        res.status(200).json({ status: "success", comments: reports });
    }
    catch (error) {
        console.log("Error at reportedComments", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.reportedComments = reportedComments;
// Admin event block/unblock : /admin/report-event
const toggleEvent = async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id);
        const event = await eventRepo.findById(id);
        if (!event) {
            return res
                .status(404)
                .json({ status: "error", message: "Event not found" });
        }
        await eventRepo.findOneAndUpdate({ _id: id }, { isActive: !event.isActive });
        res.status(200).json({ status: "success" });
    }
    catch (error) {
        console.log("Error at toggleEvent", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.toggleEvent = toggleEvent;
// Admin comment block/unblock : /admin/report-comment
const toggleComment = async (req, res) => {
    try {
        const { id } = req.body;
        const comment = await commentRepo.findById(id);
        if (!comment) {
            return res
                .status(404)
                .json({ status: "error", message: "Comment not found" });
        }
        await commentRepo.findOneAndUpdate({ _id: id }, { isActive: !comment.isActive });
        res.status(200).json({ status: "success" });
    }
    catch (error) {
        console.log("Error at toggleComment", error.message);
        res.status(500).json({ message: error.message, status: "error" });
    }
};
exports.toggleComment = toggleComment;
