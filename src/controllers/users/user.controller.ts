import {Request, Response} from "express";
import db from "../../db/db";
import {AuthenticatedRequest} from "../../helpers/middlewares/authMiddleware";
import {logger} from "../../helpers/middlewares/logger";
import {getCircularReplacer} from "../../helpers/middlewares/getCircularReplacer";

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await db("users")
            .where({is_deleted: false})
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at");

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getUser = async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const [user] = await db("users")
            .where({id, is_deleted: false})
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at");

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    const authenticatedReq = req as AuthenticatedRequest;

    if (!authenticatedReq.user || !authenticatedReq.user.id) {
        logger.error("User not found in request object");
        return res.status(401).json({error: "Unauthorized"});
    }

    try {
        const result = await db("users")
            .where({id: authenticatedReq.user.id, is_deleted: false})
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at")
            .first();

        if (!result) {
            logger.error(`User with ID ${authenticatedReq.user.id} not found or is deleted`);
            return res.status(404).json({error: "User not found"});
        }

        const user = result;

        const replacer = getCircularReplacer();
        const safeUser = JSON.parse(JSON.stringify(user, replacer));

        logger.debug("Current user:", safeUser);
        res.status(200).json(safeUser);
    } catch (error) {
        logger.error("Error fetching current user:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const {id} = req.params;
    const {name, email, phoneNumber, isVerified, isBlacklisted} = req.body;

    const userDeletedOrNotExist = await db("users")
        .where({id, is_deleted: false})
        .first();

    if (!userDeletedOrNotExist) {
        return res.status(404).json({error: "User not found"});
    }

    try {
        const updated = await db("users")
            .where({id, is_deleted: false})
            .update({
                name,
                email,
                phone_number: phoneNumber,
                is_verified: isVerified,
                is_blacklisted: isBlacklisted,
                updated_at: new Date(),
            });

        if (!updated) {
            return res.status(404).json({error: "User not found or no changes made"});
        }

        const [user] = await db("users")
            .where({id})
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at");

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const deleted = await db("users")
            .where({id})
            .update({is_deleted: true});

        if (!deleted) {
            return res.status(404).json({error: "User not found"});
        }

        res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
