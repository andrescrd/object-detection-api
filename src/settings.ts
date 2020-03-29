
import * as fs from "fs";
import { ISetting } from "./interfaces/ISettings.interface";

export const getSettings = async () => (await loadSettings());
export const getPort = async () => (await loadSettings()).port;
export const getCronExpressionSync = async () => (await loadSettings()).cronExpressionSync;
export const getMobilenetSettings = async () => (await loadSettings()).mobilenet;
export const getFaceDetectionSettings = async () => (await loadSettings()).faceDetection;

export const loadSettings = (): Promise<ISetting> => {
    return new Promise<ISetting>((resolve, reject) => {
        const prefix = process.env.NODE_ENV !== "prod" ? ".development" : "";
        fs.readFile(
            __dirname + "/settings" + prefix + ".json",
            "utf8",
            (err, data) => {
                if (err) {
                    return reject(err);
                }
                const ciSettings: ISetting = JSON.parse(data);
                return resolve(ciSettings);
            }
        );
    });
};