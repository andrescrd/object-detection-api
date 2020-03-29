import { Request, Response, NextFunction } from "express";

let devices: string[] = [];
const timeout: number = 1000;

export const canRequest = (deviceId: string): boolean => {
    if (devices.indexOf(deviceId) > -1) {
        return false
    } else {
        devices.push(deviceId);
        setTimeout(() => {
            devices = devices.filter(d => d != deviceId);
        }, timeout)
        return true
    }
}

export const canRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let deviceId = req.headers['deviceId'] || req.body.deviceId || req.query['deviceId'];

    if (!deviceId) {
        return res.status(401).send({ message: "must provide deviceId" })
    }
    if (canRequest(deviceId)) {
        next();
    } else {
        return res.status(401).send({
            message: "rate limit exceded"
        })
    }
}