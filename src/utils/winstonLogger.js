import winston from "winston";
import { nodeEnv } from "../config/config.js";

let transports

if (nodeEnv == 'production') {
    transports = [
        new winston.transports.File({
            level: "error",
            filename: "errors.log"
        })
    ]
} else {
    transports = [
        new winston.transports.Console({
            level: "debug"
        })
    ]
}

export const winstonLogger = winston.createLogger({
    transports
})