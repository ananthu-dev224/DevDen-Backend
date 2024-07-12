import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { UserRepository } from "../repository/userRepository";

const userRepo = new UserRepository();

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("verify token middleware user auth...");
  const auth_header = req.headers["authorization"];
  if (!auth_header) {
    return res
      .status(400)
      .json({ message: "No token in request", status: "error" });
  }

  const token = auth_header.split(" ")[1];
  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    async (err: JsonWebTokenError | null, decoded: any) => {
      if (err) {
        console.log(err);
        err instanceof TokenExpiredError
          ? res.status(400).json({ message: "Token expired", status: "error" })
          : res.status(400).json({
              message: "Failed to authenticate token",
              status: "error",
            });
      }

      if (!decoded || !decoded.role) {
        return res
          .status(400)
          .json({ message: "Invalid Token Structure", status: "error" });
      }
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      const userData = await userRepo.findById(decoded.userId);
      if (!userData?.isActive) {
        return res
          .status(400)
          .json({ message: "Your access has been restricted by the admin.", status: "error" });
      }
      next();
    }
  );
};

// Checking role user
export const authorizeRole =
  (requiredRole: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !req.user.role.includes(requiredRole)) {
      return res
        .status(400)
        .json({ message: "Access Denied", status: "error" });
    }
    next();
};