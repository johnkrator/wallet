"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
exports.logger = winston_1.default.createLogger({
    level: "debug", // Set the log level to capture all messages
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`;
    })),
    transports: [
        new winston_1.default.transports.Console(), // Log to the console
        new winston_1.default.transports.File({ filename: "app.log" }) // Log to a file
    ]
});
//# sourceMappingURL=logger.js.map