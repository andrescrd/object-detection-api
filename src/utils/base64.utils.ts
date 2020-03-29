import sharp from 'sharp';
import canvas, { Canvas } from 'canvas';
import fs from 'fs';

export const base64Prefix = 'data:image/jpg;base64,';

export const base64Encode = (file: string) => {
    let bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

export const base64ToImage = (base64: string): Promise<canvas.Image> => {
    return new Promise((resolve, reject) => {
        const image = new canvas.Image();

        image.onload = () => {
            return resolve(image);
        }

        image.onerror = reject
        image.src = base64;
    })
}

export const base64toCanvas = (base64: string): Promise<canvas.Canvas> => {
    return new Promise(async (resolve, reject) => {
        try {
            const image = await base64ToImage(base64);
            const cv = new canvas.Canvas(image.width, image.height);
            const ctx = cv.getContext("2d");
            ctx.drawImage(image, 0, 0);

            return resolve(cv);
        } catch (e) {
            return reject(e)
        }
    })
}

export const cropBase64 = async (base64: string, box: { top: number, left: number, width: number, height: number }) => {
    const margin = 0;

    let myBase64 = base64.replace(base64Prefix, '');
    let buff = Buffer.from(myBase64, 'base64');

    return base64Prefix + (await sharp(buff).extract({ left: Math.round(box.left) - margin, top: Math.round(box.top) - margin, width: Math.round(box.width) + margin, height: Math.round(box.height) + margin }).toBuffer()).toString('base64');
}

export const rotateBase64 = async (base64: string) => {
    let myBase64 = base64.replace(base64Prefix, '');
    let buff = Buffer.from(myBase64, 'base64');

    // try {
    //     const temp = 'temp/temp.jpg';

    //     console.log( (await sharp(buff).metadata()));

    //     let orientation = (await sharp(buff).metadata()).orientation;

    //     await sharp(buff).toFile(temp);
    //     return await resetOrientation(myBase64, orientation);
    // } catch (error) {
    //     console.log("read exif", error);
    // }

    return base64Prefix + (await sharp(buff).rotate(90).toBuffer()).toString('base64');
}

export const resetOrientation = async (srcBase64: string, srcOrientation: number | undefined) => {
    let buff = Buffer.from(srcBase64, 'base64');
    let image = sharp(buff);

    switch (srcOrientation) {
        case 2:
            image = image.flop(true)
            break;
        case 3:
            image = image.rotate(180)
            break;
        case 4:
            image = image.flop().rotate(180);
            break;
        case 5:
            image = image.rotate(90).flop(true);
            break;
        case 6:
            image = image.rotate(90);
            break;
        case 7:
            image = image.flop(true).rotate(90);
            break;
        case 8:
            image = image.rotate(-90);
            break
        default:
            break
    }

    return base64Prefix + (await image.toBuffer()).toString('base64')
};
