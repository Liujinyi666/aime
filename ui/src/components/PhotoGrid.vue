<template>
  <div class="grid">
    <div
      v-for="item in visibleItems"
      :key="item.path"
      class="item"
      :class="{ selected: selectedPaths.includes(item.path) }"
    >
      <div v-if="item.type === 'dir'" class="folder" @click="openDir(item.path)">
        <span class="folder-icon">📁</span>
      </div>
      <div v-else class="photo">
        <img
          :src="getThumbnailUrl(item.path)"
          :alt="item.name"
          loading="lazy"
          @click="onPhotoClick(item.path, $event)"
        />
        <button class="exclude-btn" @click.stop="excludePhoto(item.path)" title="排除">×</button>
      </div>
      <span v-if="item.type === 'dir' || showNames" class="name">{{ item.name }}</span>
    </div>
    <div v-if="!visibleItems.length" class="empty">此目录下没有照片</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import type { PhotoItem } from "@/types";
import { getThumbnailUrl } from "@/api";

const props = defineProps<{
  items: PhotoItem[];
  showNames: boolean;
  columns: number;
  selectedPaths: string[];
}>();
const emit = defineEmits<{
  openDir: [path: string];
  viewPhoto: [path: string];
  toggleSelect: [path: string];
}>();

const excludedPaths = reactive(new Set<string>());
const visibleItems = computed(() => props.items.filter(item => !excludedPaths.has(item.path)));

function openDir(path: string) {
  emit("openDir", path);
}
function onPhotoClick(path: string, e: MouseEvent) {
  if (e.ctrlKey || e.metaKey) {
    emit("toggleSelect", path);
  } else {
    emit("viewPhoto", path);
  }
}
function excludePhoto(path: string) {
  excludedPaths.add(path);
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(v-bind(columns), 1fr);
  gap: 16px;
  padding: 16px;
}
.item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  background: #fff;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}
.item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.item.selected {
  transform: translateY(-6px);
  box-shadow: 0 6px 20px rgba(74, 144, 217, 0.3);
  border-color: #4a90d9;
  outline: 2px solid #4a90d9;
  outline-offset: -2px;
  z-index: 1;
}
.folder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  aspect-ratio: 4 / 3;
}
.folder-icon {
  font-size: 48px;
}
.photo {
  position: relative;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}
.photo img {
  max-width: 100%;
  max-height: 100%;
  display: block;
  object-fit: contain;
}
.exclude-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}
.photo:hover .exclude-btn {
  opacity: 1;
}
.exclude-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}
.name {
  display: block;
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  padding: 48px;
}
</style>
