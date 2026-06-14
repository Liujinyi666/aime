import fs from "node:fs";
import path from "node:path";
import { config } from "../config.js";
import type { DirectoryContents, PhotoItem } from "../types.js";

const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif",
]);

function isImageFile(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function sanitizeRelativePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/\\/g, "/");
  if (normalized.startsWith("..") || normalized.startsWith("/")) {
    return "";
  }
  return normalized;
}

export function scanDirectory(relativePath: string): DirectoryContents {
  const safePath = relativePath ? sanitizeRelativePath(relativePath) : "";
  const targetDir = path.join(config.photoDir, safePath);

  if (!targetDir.startsWith(config.photoDir)) {
    return { items: [], currentPath: "", parentPath: null };
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(targetDir, { withFileTypes: true });
  } catch {
    return { items: [], currentPath: safePath, parentPath: null };
  }

  const items: PhotoItem[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const relative = safePath ? `${safePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      items.push({ name: entry.name, path: relative, type: "dir" });
    } else if (entry.isFile() && isImageFile(entry.name)) {
      items.push({ name: entry.name, path: relative, type: "file" });
    }
  }

  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const parentPath = safePath
    ? safePath.replace(/\/[^/]+$/, "") || null
    : null;

  return { items, currentPath: safePath, parentPath };
}
