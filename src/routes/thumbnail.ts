import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";
import { config } from "../config.js";

const router = Router();

router.get("/thumbnail", async (req, res) => {
  const relativePath = req.query.path as string;
  if (!relativePath) {
    return res.status(400).send("Missing path parameter");
  }

  const normalized = path.normalize(relativePath).replace(/\\/g, "/");
  if (normalized.startsWith("..") || normalized.startsWith("/")) {
    return res.status(400).send("Invalid path");
  }

  const sourcePath = path.join(config.photoDir, normalized);
  if (!sourcePath.startsWith(config.photoDir)) {
    return res.status(400).send("Invalid path");
  }

  const cacheKey = crypto.createHash("md5").update(normalized).digest("hex") + ".jpg";
  const cachePath = path.join(config.thumbnailCacheDir, cacheKey);

  if (fs.existsSync(cachePath)) {
    return res.sendFile(cachePath);
  }

  try {
    const thumbnail = await sharp(sourcePath)
      .rotate()
      .resize(400, undefined, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer();

    if (!fs.existsSync(config.thumbnailCacheDir)) {
      fs.mkdirSync(config.thumbnailCacheDir, { recursive: true });
    }
    fs.writeFileSync(cachePath, thumbnail);

    const maxAge = 7 * 24 * 60 * 60; // 7 days
    res.set("Cache-Control", `public, max-age=${maxAge}`);
    res.type("jpeg");
    res.send(thumbnail);
  } catch {
    res.redirect(`/photos/${encodeURIComponent(normalized)}`);
  }
});

export default router;
