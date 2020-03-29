import { ICocoSsd } from './../interfaces/ICocoSsd.interface';
import tf from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
require('@tensorflow/tfjs-node');
import * as automl from '@tensorflow/tfjs-automl';
import { base64toCanvas,  base64Encode } from './base64.utils';
import fs from "fs";
import path from 'path';
import cocoSsd = require("@tensorflow-models/coco-ssd");
import * as faceapi from 'face-api.js';
import { canvas } from './env';
import { faceDetectionNet, faceDetectionOptions } from './face-detection';

export const objectDetection = async (modelPath: string, base64: string, score = 0.8, max_to_return = 3) => {
  const model = await automl.loadObjectDetection(modelPath);
  const options = { score: score, topk: max_to_return };
  const image = await base64toCanvas(base64);
  let predictions = await model.detect(<any>image, options);
  return predictions;
}

export const classification = async (modelPath: string, base64: string, max_to_return = 5) => {
  const model = await automl.loadImageClassification(modelPath);
  const image = await base64toCanvas(base64);
  const predictions = await model.classify(<any>image, { centerCrop: true });
  const newPrediction = predictions.sort((a: automl.ImagePrediction, b: automl.ImagePrediction) => {
    return b.prob - a.prob;
  });
  return newPrediction.slice(0, max_to_return);
}


export const objectDetectionCocoSsd = async (modelPath: string, base64: string, score = 0.8, max_to_return = 3) => {
  const classPerson = 'person'
  const model = await cocoSsd.load({ modelUrl: modelPath });
  const image = await base64toCanvas(base64);
  const predictions: ICocoSsd[] = await model.detect(<any>image, max_to_return);
  const newPrediction = predictions.filter(p => p.class === classPerson && p.score >= score);

  return newPrediction.slice(0, max_to_return);
}

export const faceDetection = async (modelPath: string, base64: string, score = 0.8, max_to_return = 3) => {
  // await faceapi.nets.ageGenderNet.loadFromDisk("D:/Documents/_Develop/object-detection-api/dist/tf_models/face_detection");
  
  await faceDetectionNet.loadFromDisk('D:/Documents/_Develop/object-detection-api/dist/tf_models/face_detection')
  await faceapi.nets.ageGenderNet.loadFromDisk('D:/Documents/_Develop/object-detection-api/dist/tf_models/face_detection')

 const img =  await base64ToImage(base64);
  // const img = await canvas.loadImage('D:/Documents/_Develop/face-api.js/examples/images/bbt1.jpg')

  const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
    .withAgeAndGender()

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