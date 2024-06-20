import {Request, Response, NextFunction} from "express";
import jwt, {Secret} from "jsonwebtoken";
import db from "../../db/db";

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        id: string;
        name: string;
        isVerified: boolean;
    } | null;
}

export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.jwt;
    // console.log("Token from cookies:", token);

    if (!token) {
        return res.status(401).json({message: "Token missing"});
    }

    try {
        const decodedToken = jwt.decode(token, {complete: true});
        // console.log("Decoded Token Structure:", decodedToken);

        if (!decodedToken) {
            throw new Error("Token is not correctly formed or invalid.");
        }

        const verifiedToken: any = jwt.verify(token, process.env.JWT_SECRET as Secret);
        // console.log("Verified Token:", verifiedToken);

        const currentTime = Math.floor(Date.now() / 1000);
        if (verifiedToken.exp < currentTime) {
            return res.status(401).json({message: "Token has expired. Please log in again."});
        }

        // console.log("About to query the database");

        const user = await db("users")
            .where("id", verifiedToken.userId)
            .first();

        // console.log("Queried the database");

        if (!user) {
            return res.status(401).json({message: "User not found"});
        }

        req.user = {
            userId: user.id,
            id: user.id,
            name: user.name,
            isVerified: user.is_verified,
        };

        // console.log("User set on req object:", req.user);

        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({message: "Not authorized. Please login again."});
    }
};
