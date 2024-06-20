"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const checkBlacklist_1 = require("../../helpers/middlewares/checkBlacklist");
const db_1 = __importDefault(require("../../db/db"));
const crypto_1 = __importDefault(require("crypto"));
const sendRegistrationVerificationEmail_1 = __importDefault(require("../../helpers/emailService/sendRegistrationVerificationEmail"));
const generateToken_1 = __importDefault(require("../../helpers/middlewares/generateToken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phoneNumber, password } = req.body;
    // Password validation regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!name || !email || !phoneNumber || !password) {
        return res.status(400).json({ message: "Please provide all the required fields" });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        });
    }
    // Check if the user is on the blacklist
    const isBlacklisted = yield (0, checkBlacklist_1.checkBlacklist)(email, phoneNumber);
    if (isBlacklisted) {
        return res.status(400).json({ error: "User is on the blacklist" });
    }
    // Check if the email or phone number already exists in the database
    const emailExists = yield (0, db_1.default)("users")
        .where({ email })
        .orWhere({ phone_number: phoneNumber })
        .first();
    if (emailExists) {
        return res.status(400).json({ error: "Email or phone number already exists" });
    }
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
    try {
        // Generate a 6-digit verification code
        const verificationCode = crypto_1.default.randomInt(100000, 999999).toString();
        // Create a new user
        const userInsertResult = yield (0, db_1.default)("users").insert({
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
        const [user] = yield (0, db_1.default)("users").where({ id: userId }).select("*");
        // Create a new wallet for the user
        const walletInsertResult = yield (0, db_1.default)("wallets").insert({
            user_id: userId,
        });
        // Fetch the wallet details using the walletId
        const walletId = walletInsertResult[0];
        const [wallet] = yield (0, db_1.default)("wallets").where({ id: walletId }).select("*");
        if (!wallet) {
            throw new Error("Wallet creation failed.");
        }
        // Send the verification email
        yield (0, sendRegistrationVerificationEmail_1.default)(email, verificationCode);
        // Generate a JWT token for the new user
        const token = (0, generateToken_1.default)(res, userId.toString(), name);
        res.status(201).json({ user, wallet, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
        throw error;
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user by email
        const [user] = yield (0, db_1.default)("users")
            .where("email", email)
            .select("*");
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Check if the user is verified
        if (!user.is_verified) {
            return res.status(403).json({ error: "Please verify your email before logging in" });
        }
        // Verify the password
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate a JWT token
        const token = (0, generateToken_1.default)(res, user.id.toString(), user.name);
        // Remove the password field from the user object
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(200).json({ user: userWithoutPassword, token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.login = login;
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, verificationCode } = req.body;
    try {
        // Find the users by email
        const [user] = yield (0, db_1.default)("users")
            .where("email", email)
            .select("*");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Check if the verification code matches
        if (user.verification_code !== verificationCode) {
            return res.status(400).json({ error: "Invalid verification code" });
        }
        // Update the user's is_verified column to true
        yield (0, db_1.default)("users")
            .where("id", user.id)
            .update({ is_verified: true, verification_code: null });
        res.status(200).json({ message: "Email verification successful" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=onboarding.controller.js.map