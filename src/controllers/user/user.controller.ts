import {Request, Response} from "express";
import db from "../../db/db";
import {CustomRequest} from "../../helpers/custom";

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

export const getCurrentUser = async (req: CustomRequest, res: Response) => {
    const userId = req.user.id;
    console.log("User ID:", userId);

    try {
        const [user] = await db("users")
            .where({id: userId, is_deleted: false})
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at");

        console.log("SQL Query:", db("users").where({id: userId}).select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at").toString());

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
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

    // Check if phone number already exists
    const phoneNumberExist = await db("users")
        .where({phone_number: phoneNumber})
        .orWhere({email})
        .first();

    if (phoneNumberExist && phoneNumberExist.id !== id) {
        return res.status(400).json({error: "Phone number or email already exists"});
    }

    try {
        const updated = await db("users")
            .where({id})
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
