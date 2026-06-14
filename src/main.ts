import express from "express";
import path from "node:path";
import { config } from "./config.js";
import photosRouter from "./routes/photos.js";

const app = express();

app.use("/api", photosRouter);
app.use("/photos", express.static(config.photoDir));

app.listen(config.port, () => {
  console.log(`Aime server running at http://localhost:${config.port}`);
});
