import path from "node:path";
import os from "node:os";

export const config = {
  photoDir: path.resolve(process.env.AIME_PHOTO_DIR || "D:\\test"),
  port: parseInt(process.env.AIME_PORT || "3000", 10),
  thumbnailCacheDir: path.join(os.tmpdir(), "aime-thumbnails"),
};
