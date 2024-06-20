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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../db/db"));
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.jwt;
    // console.log("Token from cookies:", token);
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.decode(token, { complete: true });
        // console.log("Decoded Token Structure:", decodedToken);
        if (!decodedToken) {
            throw new Error("Token is not correctly formed or invalid.");
        }
        const verifiedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // console.log("Verified Token:", verifiedToken);
        const currentTime = Math.floor(Date.now() / 1000);
        if (verifiedToken.exp < currentTime) {
            return res.status(401).json({ message: "Token has expired. Please log in again." });
        }
        // console.log("About to query the database");
        const user = yield (0, db_1.default)("users")
            .where("id", verifiedToken.userId)
            .first();
        // console.log("Queried the database");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = {
            userId: user.id,
            id: user.id,
            name: user.name,
            isVerified: user.is_verified,
        };
        // console.log("User set on req object:", req.user);
        next();
    }
    catch (error) {
        console.error("Error verifying token:", error);
        return res.status(401).json({ message: "Not authorized. Please login again." });
    }
});
exports.authenticate = authenticate;
//# sourceMappingURL=authMiddleware.js.map