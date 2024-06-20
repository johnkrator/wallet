import winston from "winston";

export const logger = winston.createLogger({
    level: "debug", // Set the log level to capture all messages
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({level, message, timestamp}) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // Log to the console
        new winston.transports.File({filename: "app.log"}) // Log to a file
    ]
});
