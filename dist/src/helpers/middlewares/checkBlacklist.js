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
exports.checkBlacklist = void 0;
const axios_1 = __importDefault(require("axios"));
const checkBlacklist = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Make a request to the Lendsqr Adjutor Karma API to check if the users is blacklisted
        const emailResponse = yield axios_1.default.get(`https://adjutor.lendsqr.com/karma/blacklist/check?email=${email}`, {
            headers: {
                "Authorization": `Bearer ${process.env.LENDSQR_API_KEY}`,
            },
        });
        const phoneNumberResponse = yield axios_1.default.get(`https://adjutor.lendsqr.com/karma/blacklist/check?phoneNumber=${phoneNumber}`, {
            headers: {
                "Authorization": `Bearer ${process.env.LENDSQR_API_KEY}`,
            },
        });
        // If either the email or phone number is blacklisted, return true
        return emailResponse.data.isBlacklisted || phoneNumberResponse.data.isBlacklisted;
    }
    catch (error) {
        console.error("Error checking blacklist:", error);
        // In case of an error, assume the users is not blacklisted
        return false;
    }
});
exports.checkBlacklist = checkBlacklist;
//# sourceMappingURL=checkBlacklist.js.map