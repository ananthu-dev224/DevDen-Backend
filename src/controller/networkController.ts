import { Request, Response } from "express";
import { UserRepository } from "../repository/userRepository";
import { NotificationsRepository } from "../repository/notificationsRepository";
import { NetworkRepository } from "../repository/networkRepository";
import { EventRepository } from "../repository/eventRepository";

const userRepo = new UserRepository();
const networkRepo = new NetworkRepository();
const eventRepo = new EventRepository();
const notiRepo = new NotificationsRepository();

// search users : /user/search/:query
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const query = req.params.query;
    const users = await userRepo.searchUsers(query);
    res.status(200).json({ status: "success", users });
  } catch (error: any) {
    console.log("Error at searchUsers", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// get user data : /user/profile/:userId
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userRepo.findById(userId);
    const events = await eventRepo.userEvents(userId);

    const sortedEvents = events.sort((a, b) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });
    res.status(200).json({ status: "success", user, events: sortedEvents });
  } catch (error: any) {
    console.log("Error at getUserDetails", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// follow : /user/follow
export const followUser = async (req: Request, res: Response) => {
  try {
    const { followerId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required", status: "error" });
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", status: "error" });
    }
    const noti = `@${user.username} started following you`;
    const notification = {
      userId:followerId,
      noti,
    };
    await Promise.all([
      networkRepo.addNetwork(userId, followerId),
      notiRepo.addNotification(notification),
    ])
    res
      .status(200)
      .json({ message: "Followed successfully", status: "success" });
  } catch (error: any) {
    console.error("Error following user:", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// unfollow : /user/unfollow
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { followerId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required", status: "error" });
    }

    await networkRepo.removeNetwork(userId, followerId);
    res
      .status(200)
      .json({ message: "Unfollowed successfully", status: "success" });
  } catch (error: any) {
    console.error("Error unfollowing user:", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// followers : /user/followers/:userId
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const followers = await networkRepo.getFollowers(userId);
    res.status(200).json({ status: "success", followers });
  } catch (error: any) {
    console.error("Error retrieving followers:", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// following : /user/following/:userId
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const following = await networkRepo.getFollowing(userId);
    res.status(200).json({ status: "success", following });
  } catch (error: any) {
    console.error("Error retrieving following:", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};





