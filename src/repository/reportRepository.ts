import commentReportModel from "../model/commentReportSchema";
import eventReportModel from "../model/eventReportSchema";
import mongoose from "mongoose";

export class ReportRepository {
  async addEventReport(data:{userId:any,eventId:any,reportType:string}) {
    try {
      const res = await eventReportModel.findOneAndUpdate(
        { eventId: data.eventId, reportType: data.reportType },
        {
          $inc: { count: 1 }, // Increment the count by 1
          $push: { users: data.userId }, // Add the userId to the users array
        },
        { new: true, upsert: true } // Upsert option to create the document if it doesn't exist
      );
      return res;
    } catch (error: any) {
      console.log("DB error at addEventReport", error.message);
      throw new Error(`DB error at addEventReport : ${error.message}`);
    }
  }

  async addCommentReport(data:{userId:any,commentId:any,reportType:string}) {
    try {
      const res = await commentReportModel.findOneAndUpdate(
        { commentId: data.commentId, reportType: data.reportType },
        {
          $inc: { count: 1 }, // Increment the count by 1
          $push: { users: data.userId }, // Add the userId to the users array
        },
        { new: true, upsert: true } // Upsert option to create the document if it doesn't exist
      );
      return res;
    } catch (error: any) {
      console.log("DB error at addCommentReport", error.message);
      throw new Error(`DB error at addCommentReport : ${error.message}`);
    }
  }

  async findEventReport(eventId: any, reportType:string, userId:any  ) {
    try {
      const report = await eventReportModel.findOne({eventId,reportType,users:{$in:[userId]}});
      return report;
    } catch (error: any) {
      console.log("DB error at Report findEventReport", error.message);
      throw new Error(`DB error at Report findEventReport : ${error.message}`);
    }
  }

  async findCommentReport(commentId: any, reportType:string, userId:any ) {
    try {
      const report = await commentReportModel.findOne({commentId,reportType,users:{$in:[userId]}});
      return report;
    } catch (error: any) {
      console.log("DB error at Report findCommentReport", error.message);
      throw new Error(`DB error at Report findCommentReport : ${error.message}`);
    }
  }

  async allEventReports() {
    try {
      const reports = await eventReportModel.find().populate('eventId').sort({ count: -1 });
      return reports;
    } catch (error: any) {
      console.log("DB error at Report allEventReports", error.message);
      throw new Error(`DB error at Report allEventReports : ${error.message}`);
    }
  }

  async allCommentReports() {
    try {
      const reports = await commentReportModel.find().populate('commentId').sort({ count: -1 });
      return reports;
    } catch (error: any) {
      console.log("DB error at Report allCommentReports", error.message);
      throw new Error(`DB error at Report allCommentReports : ${error.message}`);
    }
  }



}