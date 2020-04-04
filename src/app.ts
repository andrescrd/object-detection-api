import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { getFaceDetectionSettings, getMobilenetSettings, getPort } from './settings';
import { faceDetection, objectDetectionCocoSsd } from "./utils/tensorflow.utils";

const app = express();
app.use(cors());
app.use(bodyParser.json({
  limit: '50mb'
}));

app.use('/static', express.static((process.cwd() + '/tf_models')));

//endpoint for test
app.get("/", (req, res) => {
  return res.status(200).send("object-detection-api")
})

app.post("/detect", async (req, res) => {
  if (!req.body.image) {
    return res.status(400).send({
      message: 'image is required'
    });
  }

  let base64 = req.body.image;
  const mobilenetSettings = await getMobilenetSettings();
  let objectDetected = await objectDetectionCocoSsd(mobilenetSettings.uri, base64, mobilenetSettings.minScore, 1);

  if (objectDetected.length == 0) {
    return res.status(404).send({ message: "person not founded" })
  }

  const faceDetectionSettings = await getFaceDetectionSettings();
  let faceDetected = await faceDetection(faceDetectionSettings.path, base64, faceDetectionSettings.minScore, 1)

  if (faceDetected && faceDetected.length > 0) {
    return res.status(200).send({ status: 'in', data: faceDetected });
  } else {
    return res.status(200).send({ status: 'out', data: [] })
  }
});

const startServer = async () => {
  // start the express server2
  app.listen(await getPort(), async () => {
    console.log(`server started at http://localhost:${await getPort()}`);
  });
}

startServer();