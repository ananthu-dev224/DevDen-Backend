import { CommentRepository } from "../repository/commentRepository";
import { Request, Response } from "express";


const commentRepo = new CommentRepository();

// Add new comment : /user/add-comment
export const addComment = async (req: Request, res: Response) => {
    try {
      const {
        eventId,
        userId,
        text
      } = req.body;
      
      const data = {
        eventId,
        userId,
        text
      }

      const newComment = await commentRepo.addComment(data)

  
      res.status(200).json({
        message: "Comment added successfully",
        status: "success",
        newComment
      });
    } catch (error: any) {
      console.log("Error at addComment", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};

// event comments : /user/comments/:id
export const getEventComment = async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id;
      
      const comments = await commentRepo.findByEvent(eventId)


  
      res.status(200).json({
        status: "success",
        comments
      });
    } catch (error: any) {
      console.log("Error at getEventComment", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};


// delete comment : /user/delete-comment/:id
export const deleteComment = async (req: Request, res: Response) => {
    try {
      const commentId = req.params.id;
      await commentRepo.findByCommentIdAndDelete(commentId)  
      res.status(200).json({
        status: "success",
      });
    } catch (error: any) {
      console.log("Error at deleteComment", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};

// comment like : /user/like-comment
export const likeComment =  async (req: Request, res: Response) => {
    try {
      const {userId, commentId} = req.body;
      const comment = await commentRepo.findById(commentId);
  
      if (!comment) {
        return res.status(404).json({ status: 'error', message: 'Event not found' });
      }
    
      let updatedLikes;
  
      if (comment.likes.includes(userId)) {
        updatedLikes = comment.likes.filter((id: any) => id.toString() !== userId);
      } else {
        updatedLikes = [...comment.likes, userId];
      }
  
      const result = await commentRepo.findOneAndUpdate(
        { _id: commentId },
        { likes: updatedLikes }
      );
      res.status(200).json({ status: 'success', updatedLikes:result?.likes });
    } catch (error: any) {
      console.log("Error at likeComment", error.message);
      res.status(500).json({ message: error.message, status: "error" });
    }
};