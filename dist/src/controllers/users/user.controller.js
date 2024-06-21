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
exports.deleteUser = exports.updateUser = exports.getCurrentUser = exports.getUser = exports.getUsers = void 0;
const db_1 = __importDefault(require("../../db/db"));
const logger_1 = require("../../helpers/middlewares/logger");
const getCircularReplacer_1 = require("../../helpers/middlewares/getCircularReplacer");
const getUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, db_1.default)("users")
            .where({ is_deleted: false })
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at");
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [user] = yield (0, db_1.default)("users")
            .where({ id, is_deleted: false })
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getUser = getUser;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authenticatedReq = req;
    if (!authenticatedReq.user || !authenticatedReq.user.id) {
        logger_1.logger.error("User not found in request object");
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const result = yield (0, db_1.default)("users")
            .where({ id: authenticatedReq.user.id, is_deleted: false })
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at")
            .first();
        if (!result) {
            logger_1.logger.error(`User with ID ${authenticatedReq.user.id} not found or is deleted`);
            return res.status(404).json({ error: "User not found" });
        }
        const user = result;
        const replacer = (0, getCircularReplacer_1.getCircularReplacer)();
        const safeUser = JSON.parse(JSON.stringify(user, replacer));
        logger_1.logger.debug("Current user:", safeUser);
        res.status(200).json(safeUser);
    }
    catch (error) {
        logger_1.logger.error("Error fetching current user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getCurrentUser = getCurrentUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, phoneNumber, isVerified, isBlacklisted } = req.body;
    const userDeletedOrNotExist = yield (0, db_1.default)("users")
        .where({ id, is_deleted: false })
        .first();
    if (!userDeletedOrNotExist) {
        return res.status(404).json({ error: "User not found" });
    }
    try {
        const updated = yield (0, db_1.default)("users")
            .where({ id, is_deleted: false })
            .update({
            name,
            email,
            phone_number: phoneNumber,
            is_verified: isVerified,
            is_blacklisted: isBlacklisted,
            updated_at: new Date(),
        });
        if (!updated) {
            return res.status(404).json({ error: "User not found or no changes made" });
        }
        const [user] = yield (0, db_1.default)("users")
            .where({ id })
            .select("id", "name", "email", "phone_number", "is_verified", "is_blacklisted", "created_at", "updated_at");
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleted = yield (0, db_1.default)("users")
            .where({ id })
            .update({ is_deleted: true });
        if (!deleted) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map