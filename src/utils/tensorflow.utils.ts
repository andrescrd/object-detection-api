import { IData } from './../interfaces/IData.interface';
import { ICocoSsd } from './../interfaces/ICocoSsd.interface';
import tf from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
require('@tensorflow/tfjs-node');
import { base64toCanvas } from './base64.utils';
import cocoSsd = require("@tensorflow-models/coco-ssd");
import * as faceapi from 'face-api.js';
import { canvas } from './env';
import { faceDetectionNet, faceDetectionOptions } from './face-detection';

export const objectDetectionCocoSsd = async (modelPath: string, base64: string, score = 0.8, max_to_return = 3) => {
  const classPerson = 'person'
  const model = await cocoSsd.load({ modelUrl: modelPath });
  const image = await base64toCanvas(base64);
  const predictions: ICocoSsd[] = await model.detect(<any>image, max_to_return);
  const newPrediction = predictions.filter(p => p.class === classPerson && p.score >= score);

  return newPrediction.slice(0, max_to_return);
}

export const faceDetection = async (modelPath: string, base64: string, score = 0.8, max_to_return = 3) => {
  await faceDetectionNet.loadFromDisk(process.cwd() + modelPath);
  await faceapi.nets.ageGenderNet.loadFromDisk(process.cwd() + modelPath);

  const img = await base64ToImage(base64);
  const results = (await faceapi.detectAllFaces(img, faceDetectionOptions(score))
    .withAgeAndGender()).map(result => <IData>{ gender: result.gender, genderProbability: result.genderProbability, age: result.age });

  return results.slice(0, max_to_return);
}

const base64ToImage = (base64: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const image = new canvas.Image();

    image.onload = () => {
      return resolve(image);
    }

    image.onerror = reject
    image.src = base64;
  })
}