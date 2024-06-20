import jwt, {Secret} from "jsonwebtoken";
import {Response} from "express";

const generateToken = (res: Response, userId: string, name: string) => {
    const secret: Secret | undefined = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT secret is not defined");
    }

    const token = jwt.sign({userId, name}, secret, {expiresIn: "7d"});

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return token;
};

export default generateToken;
