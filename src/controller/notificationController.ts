import { UserRepository } from "../repository/userRepository";
import { NotificationsRepository } from "../repository/notificationsRepository";
import { Request, Response } from "express";
import Stripe from "stripe";

const userRepo = new UserRepository();
const notiRepo = new NotificationsRepository();
const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  throw new Error("STRIPE_SECRET environment variable is not set");
}
const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-06-20",
});

// wallet withdraw : /user/withdraw
export const withdraw = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
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
        .json({ message: "User is required", status: "error" });
    }
    if (user.wallet < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient wallet balance.", status: "error" });
    }

    let accountId;

    // Check if the user has a Stripe Connect account
    if (!user.stripeAccountId) {
      // If no account exists, create one
      const account = await stripe.accounts.create({
        type: "custom",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        individual: {
          first_name: user.username,
          last_name: user.username,
          email: user.email,
          phone: "+14155552671",
          dob: {
            day: 1,
            month: 1,
            year: 1990,
          },
          address: {
            line1: "123 Main Street",
            city: "San Francisco",
            state: "CA",
            postal_code: "94105",
            country: "US",
          },
        },
        business_profile: {
          name: user.username,
          url: "https://testmode.com",
          mcc: "5732",
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: "127.0.0.1",
        },
        country: "US",
      });

      // Save the Stripe account ID to your database
      user.stripeAccountId = account.id;
      await user.save();

      accountId = account.id;
    } else {
      // Use the existing Stripe Connect account
      accountId = user.stripeAccountId;
    }

    // Transfer the specified amount to the user's Stripe Connect account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Amount in cents
      currency: "usd",
      destination: accountId,
      transfer_group: "test_group",
    });

    // Update host's payment history
    const paymentHistoryEntry = `Withdrawed $${-amount} from wallet to stripe on ${new Date().toLocaleDateString()}`;

    const updatedUser = await userRepo.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { wallet: -amount },
        $push: { paymentHistory: paymentHistoryEntry },
      }
    );

    res.status(200).json({
      status: "success",
      message: "Withdrawal successful",
      updatedUser,
    });
  } catch (error: any) {
    console.log("Error at withdraw", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// User notifications : /user/notifications
export const notifications = async (req: Request, res: Response) => {
  try {
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
        .json({ message: "User is required", status: "error" });
    }
    const notifications = await notiRepo.findByUserId(userId);
    const sorted = notifications.sort((a, b) => {
      return Number(b.createdAt) - Number(a.createdAt);
    });
    const history = user.paymentHistory.reverse();
    res.status(200).json({ status: "success", notifications: sorted, history });
  } catch (error: any) {
    console.log("Error at notifications", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};

// clear user notifications : /user/clear-notifications
export const clearNotifications = async (req: Request, res: Response) => {
  try {
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
        .json({ message: "User is required", status: "error" });
    }
    // Delete all notifications for the user
    await notiRepo.deleteMany(userId);

    // Clear the payment history array
    user.paymentHistory = [];
    await user.save();

    res.status(200).json({ status: "success", message: "Notifications and payment history cleared." });
  } catch (error: any) {
    console.log("Error at clearNotifications", error.message);
    res.status(500).json({ message: error.message, status: "error" });
  }
};
