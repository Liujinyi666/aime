import { Router } from "express";
import { scanDirectory } from "../services/file-scanner.js";

const router = Router();

router.get("/photos", (req, res) => {
  const relativePath = (req.query.path as string) || "";
  const result = scanDirectory(relativePath);
  res.json(result);
});

export default router;
