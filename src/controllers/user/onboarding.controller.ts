import {Request, Response} from "express";
import bcrypt from "bcrypt";
import {checkBlacklist} from "../../helpers/middlewares/checkBlacklist";
import db from "../../db/db";
import crypto from "crypto";
import sendRegistrationVerificationEmail from "../../helpers/emailService/sendRegistrationVerificationEmail";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
    const {name, email, phoneNumber, password} = req.body;

    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!name || !email || !phoneNumber || !password) {
        return res.status(400).json({message: "Please provide all the required fields"});
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message:
                "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
    }

    // Check if the user is on the blacklist
    const isBlacklisted = await checkBlacklist(email, phoneNumber);
    if (isBlacklisted) {
        return res.status(400).json({error: "User is on the blacklist"});
    }

    // Check if the email or phone number already exists in the database
    const emailExists = await db("users")
        .where({email})
        .orWhere({phone_number: phoneNumber})
        .first();

    if (emailExists) {
        return res.status(400).json({error: "Email or phone number already exists"});
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
        // Generate a 6-digit verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Create a new user
        const userInsertResult = await db("users")
            .insert({
                name,
                email,
                phone_number: phoneNumber,
                password: hashedPassword,
                verification_code: verificationCode,
                is_verified: false,
            });

        // Fetch the new user's ID
        const userId = userInsertResult[0];

        // Check if user ID is correctly retrieved
        if (!userId) {
            throw new Error("User creation failed. User ID not returned.");
        }

        // Fetch the user details using the userId
        const [user] = await db("users").where({id: userId}).select("*");

        // Create a new wallet for the user
        const walletInsertResult = await db("wallets")
            .insert({
                user_id: userId,
            });

        // Fetch the wallet details using the walletId
        const walletId = walletInsertResult[0];
        const [wallet] = await db("wallets").where({id: walletId}).select("*");

        if (!wallet) {
            throw new Error("Wallet creation failed.");
        }

        // Send the verification email
        await sendRegistrationVerificationEmail(email, verificationCode);

        res.status(201).json({user, wallet});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    const {email, verificationCode} = req.body;

    try {
        // Find the user by email
        const [user] = await db("users")
            .where("email", email)
            .select("*");

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        // Check if the verification code matches
        if (user.verification_code !== verificationCode) {
            return res.status(400).json({error: "Invalid verification code"});
        }

        // Update the user's is_verified column to true
        await db("users")
            .where("id", user.id)
            .update({is_verified: true, verification_code: null});

        res.status(200).json({message: "Email verification successful"});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    try {
        // Find the user by email
        const [user] = await db("users")
            .where("email", email)
            .select("*");

        if (!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        // Check if the user is verified
        if (!user.is_verified) {
            return res.status(403).json({error: "Please verify your email before logging in"});
        }

        // Verify the password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        // Generate a JWT token
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET!, {
            expiresIn: "1h",
        });

        res.status(200).json({user, token});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
};
