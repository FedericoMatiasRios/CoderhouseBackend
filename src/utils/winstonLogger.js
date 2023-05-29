import winston from "winston";
import { nodeEnv } from "../config/config.js";

const levels = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
}

let transports

if (nodeEnv == 'production') {
    transports = [
        new winston.transports.Console({
            level: "info"
        }),
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
    levels,
    transports
});