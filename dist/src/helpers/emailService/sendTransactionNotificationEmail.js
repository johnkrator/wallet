"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const nodemailer_1 = __importDefault(require("nodemailer"));
const process = __importStar(require("node:process"));
const sendTransactionNotificationEmail = (email, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    let transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    let subject;
    let text;
    switch (transaction.type) {
        case "deposit":
            subject = "Deposit Confirmation";
            text = `Your deposit of $${transaction.amount} has been successful. Your new balance is $${transaction.balance}.`;
            break;
        case "withdrawal":
            subject = "Withdrawal Confirmation";
            text = `Your withdrawal of $${transaction.amount} has been successful. Your new balance is $${transaction.balance}.`;
            break;
        case "transfer":
            subject = "Transfer Confirmation";
            text = `Your transfer of $${transaction.amount} to ${transaction.recipientEmail} has been successful. Your new balance is $${transaction.balance}.`;
            break;
    }
    let message = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        text: text,
    };
    try {
        let info = yield transporter.sendMail(message);
        console.log("Email sent: " + info.response);
    }
    catch (error) {
        console.error(error);
    }
});
exports.default = sendTransactionNotificationEmail;
//# sourceMappingURL=sendTransactionNotificationEmail.js.map