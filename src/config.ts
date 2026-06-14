import path from "node:path";

export const config = {
  photoDir: path.resolve(process.env.AIME_PHOTO_DIR || "./photos"),
  port: parseInt(process.env.AIME_PORT || "3000", 10),
};
