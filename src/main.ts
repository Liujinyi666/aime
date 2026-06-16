import express from "express";
import path from "node:path";
import fs from "node:fs";
import { config } from "./config.js";
import { scanDirectory } from "./services/file-scanner.js";
import photosRouter from "./routes/photos.js";
import thumbnailRouter from "./routes/thumbnail.js";

const app = express();

app.use("/api", photosRouter);
app.use("/api", thumbnailRouter);
app.use("/photos", express.static(config.photoDir));

app.get("/debug", (_req, res) => {
  const entries = fs.readdirSync(config.photoDir, { withFileTypes: true });
  const list = entries.map((e) => ({ name: e.name, dir: e.isDirectory(), file: e.isFile() }));
  const scan = scanDirectory("");
  res.json({ photoDir: config.photoDir, entries: list, scan });
});

console.log(`Photo directory: ${config.photoDir}`);

app.listen(config.port, () => {
  console.log(`Aime server running at http://localhost:${config.port}`);
});
