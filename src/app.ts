import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { getPort, loadSettings, getMobilenetSettings, getFaceDetectionSettings } from './settings';
import { objectDetection, classification, objectDetectionCocoSsd, faceDetection } from "./utils/tensorflow.utils";
import { rotateBase64, cropBase64 } from "./utils/base64.utils";

const app = express();
app.use(cors());
app.use(bodyParser.json({
  limit: '50mb'
}));

app.use('/static', express.static(__dirname + '/tf_models'));

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
  // let base64Ratated = await rotateBase64(req.body.image);
  let base64 = req.body.image;
  const mobilenetSettings = await getMobilenetSettings();
  let objectDetected = await objectDetectionCocoSsd(mobilenetSettings.path, base64, mobilenetSettings.minScore);

  if (objectDetected.length == 0) {
    return res.status(200).send([])
  }

  console.log(objectDetected);

  const faceDetectionSettings = await getFaceDetectionSettings();
  let faceDetected = await faceDetection(faceDetectionSettings.path, base64, mobilenetSettings.minScore)

  if (faceDetected && faceDetected.length > 0) {
    return res.status(200).send({ status: 'in', data: faceDetected });
  } else {
    return res.status(200).send({ status: 'out' })
  }
});

const startServer = async () => {
  // start the express server2
  app.listen(await getPort(), async () => {
    console.log(`server started at http://localhost:${await getPort()}`);
  });
}

startServer();