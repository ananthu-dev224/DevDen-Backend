import { Request, Response } from "express";
import { ReportRepository } from "../repository/reportRepository";
import { CommentRepository } from "../repository/commentRepository";
import { EventRepository } from "../repository/eventRepository";
import mongoose from "mongoose";


const reportRepo = new ReportRepository();
const commentRepo = new CommentRepository();
const eventRepo = new EventRepository();

// report comment : /user/report-comment
export const reportComment = async (req: Request, res: Response) => {
    try {
      const {id,type} =  req.body;
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(404)
          .json({ status: "error", message: "Please login." });
      }

      const existingReport = await reportRepo.findCommentReport(id,type,userId)

      if (existingReport) {
        return res
          .status(400)
          .json({ status: "error", message: "You have already reported this comment." });
      }
      
      const data = {
        userId,
        commentId:id,
        reportType:type
      }

      const newReport = await reportRepo.addCommentReport(data)

      res.status(200).json({ status: "success",newReport});
    } catch (error: any) {
      console.log("Error at reportComment", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};

// report event : /user/report-event
export const reportEvent = async (req: Request, res: Response) => {
    try {
      const {id,type} =  req.body;
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(404)
          .json({ status: "error", message: "Please login." });
      }

      const existingReport = await reportRepo.findEventReport(id,type,userId)

      if (existingReport) {
        return res
          .status(400)
          .json({ status: "error", message: "You have already reported this event." });
      }
      
      const data = {
        userId,
        eventId:id,
        reportType:type
      }

      const newReport = await reportRepo.addEventReport(data)
      res.status(200).json({ status: "success",newReport});
      
    } catch (error: any) {
      console.log("Error at reportEvent", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};

// reported events admin : /admin/event-reports
export const reportedEvents = async (req: Request, res: Response) => {
  try {
    const reports = await reportRepo.allEventReports();
    res.status(200).json({ status: "success",events:reports});
  } catch (error: any) {
    console.log("Error at reportedEvents", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// reported comments admin : /admin/comment-reports
export const reportedComments = async (req: Request, res: Response) => {
  try {
    const reports = await reportRepo.allCommentReports();
    res.status(200).json({ status: "success",comments:reports});
  } catch (error: any) {
    console.log("Error at reportedComments", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Admin event block/unblock : /admin/report-event
export const toggleEvent =  async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    console.log(id)
    const event = await eventRepo.findById(id);

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
  
    await eventRepo.findOneAndUpdate(
      { _id: id },
      { isActive: !event.isActive }
    );
    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.log("Error at toggleEvent", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// Admin comment block/unblock : /admin/report-comment
export const toggleComment =  async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const comment = await commentRepo.findById(id);

    if (!comment) {
      return res.status(404).json({ status: 'error', message: 'Comment not found' });
    }
  
    await commentRepo.findOneAndUpdate(
      { _id: id },
      { isActive: !comment.isActive }
    );
    res.status(200).json({ status: 'success' });
  } catch (error: any) {
    console.log("Error at toggleComment", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};