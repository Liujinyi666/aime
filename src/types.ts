export interface PhotoItem {
  name: string;
  path: string;
  type: "file" | "dir";
}

export interface DirectoryContents {
  items: PhotoItem[];
  currentPath: string;
  parentPath: string | null;
}
