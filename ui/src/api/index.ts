import type { DirectoryContents } from "@/types";

const API_BASE = "/api";

export async function fetchPhotos(path = ""): Promise<DirectoryContents> {
  const params = path ? `?path=${encodeURIComponent(path)}` : "";
  const res = await fetch(`${API_BASE}/photos${params}`);
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
}

export function getPhotoUrl(relativePath: string): string {
  return `/photos/${encodeURIComponent(relativePath)}`;
}
