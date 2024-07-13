import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";


export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log("verify token middleware admin auth...");

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

        
        req.admin = {
          adminId: decoded.userId,
          role: decoded.role,
        };
        next();
      }
    );
};

// Checking role admin
export const authorizeRole =
  (requiredRole: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("verifying admin role...")
    if (!req.admin || !req.admin.role || !req.admin.role.includes(requiredRole)) {
      return res
        .status(400)
        .json({ message: "Access Denied : Admin Only", status: "error" });
    }
    next();
};