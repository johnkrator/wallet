import jwt from "jsonwebtoken";
import db from "../../db/db";
import {IncomingHttpHeaders} from "http";

interface DecodedToken {
    userId: number;
    iat: number;
    exp: number;
}

export interface AuthenticatedHeaders extends IncomingHttpHeaders {
    authorization?: string;
}

export const getUserByToken = async (req: { headers: AuthenticatedHeaders }) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log(token);

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        const [user] = await db("users").where({id: decoded.userId}).select("*");

        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
};
