<template>
  <div class="app">
    <header class="header">
      <h1 class="title">Aime</h1>
      <label class="toggle-label">
        <input type="checkbox" v-model="showNames" />
        显示文件名
      </label>
      <label class="toggle-label">
        每行
        <select v-model.number="columns">
          <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
        </select>
        张
      </label>
    </header>
    <BreadcrumbNav :currentPath="currentPath" @navigate="loadPath" />
    <main class="content">
      <PhotoGrid
        :items="items"
        :showNames="showNames"
        :columns="columns"
        :selectedPaths="selectedPaths"
        @openDir="loadPath"
        @viewPhoto="openLightbox"
        @toggleSelect="toggleSelect"
      />
    </main>
  </div>
  <Teleport to="body">
    <div v-if="lightboxImage" class="lightbox-overlay" @wheel.prevent="onWheel" @mousedown="onStageMouseDown">
      <div class="lightbox-transform" :style="transformStyle">
        <img :src="getPhotoUrl(lightboxImage)" class="lightbox-image" />
      </div>
    </div>
  </Teleport>
  <Teleport to="body">
    <div v-if="selectedPaths.length > 0 && !compareMode" class="selection-bar">
      <span class="selection-count">已选 {{ selectedPaths.length }} 张</span>
      <button class="selection-btn" @click="openCompare">对比</button>
      <button class="selection-btn secondary" @click="clearSelection">取消</button>
    </div>
  </Teleport>
  <Teleport to="body">
    <div v-if="compareMode" class="compare-overlay" @wheel.prevent="onCompareWheel">
      <div class="compare-grid" :style="compareGridStyle">
        <div v-for="path in comparePaths" :key="path" class="compare-cell" :data-path="path">
          <img :src="getPhotoUrl(path)" class="compare-image" :style="getCompareImageStyle(path)" />
        </div>
      </div>
      <button class="compare-exit" @click="closeCompare">✕</button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { PhotoItem } from "@/types";
import { fetchPhotos, getPhotoUrl } from "@/api";
import BreadcrumbNav from "@/components/BreadcrumbNav.vue";
import PhotoGrid from "@/components/PhotoGrid.vue";

const currentPath = ref("");
const items = ref<PhotoItem[]>([]);
const showNames = ref(true);
const columns = ref(5);

const lightboxImage = ref<string | null>(null);
const scale = ref(1);
const panX = ref(0);
const panY = ref(0);
const MIN_SCALE = 0.25;
const MAX_SCALE = 8;

const selectedPaths = ref<string[]>([]);
const compareMode = ref(false);
const comparePaths = ref<string[]>([]);
const compareScales = ref<Record<string, number>>({});
const COMPARE_MIN_SCALE = 0.25;
const COMPARE_MAX_SCALE = 8;

let isDragging = false;
let hasMoved = false;
let dragStartX = 0;
let dragStartY = 0;
let initialPanX = 0;
let initialPanY = 0;

async function loadPath(path: string) {
  currentPath.value = path;
  selectedPaths.value = [];
  try {
    const data = await fetchPhotos(path);
    items.value = data.items;
  } catch {
    items.value = [];
  }
}

function toggleSelect(path: string) {
  const idx = selectedPaths.value.indexOf(path);
  if (idx >= 0) {
    selectedPaths.value.splice(idx, 1);
  } else {
    selectedPaths.value.push(path);
  }
}

function clearSelection() {
  selectedPaths.value = [];
}

function openLightbox(path: string) {
  lightboxImage.value = path;
  scale.value = 1;
  panX.value = 0;
  panY.value = 0;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightboxImage.value = null;
  document.body.style.overflow = "";
}

function onWheel(e: WheelEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const oldScale = scale.value;
  const delta = -e.deltaY * 0.001;
  const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * (1 + delta)));
  const ratio = newScale / oldScale;
  panX.value = mouseX - ratio * (mouseX - panX.value);
  panY.value = mouseY - ratio * (mouseY - panY.value);
  scale.value = newScale;
}

function onStageMouseDown(e: MouseEvent) {
  isDragging = true;
  hasMoved = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  initialPanX = panX.value;
  initialPanY = panY.value;
  document.addEventListener("mousemove", onStageMouseMove);
  document.addEventListener("mouseup", onStageMouseUp);
}

function onStageMouseMove(e: MouseEvent) {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    hasMoved = true;
  }
  panX.value = initialPanX + dx;
  panY.value = initialPanY + dy;
}

function onStageMouseUp() {
  document.removeEventListener("mousemove", onStageMouseMove);
  document.removeEventListener("mouseup", onStageMouseUp);
  isDragging = false;
  if (!hasMoved) {
    closeLightbox();
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (compareMode.value) {
      closeCompare();
    } else if (lightboxImage.value) {
      closeLightbox();
    }
  }
}

function openCompare() {
  comparePaths.value = [...selectedPaths.value];
  compareMode.value = true;
  document.body.style.overflow = "hidden";
}

function closeCompare() {
  compareMode.value = false;
  compareScales.value = {};
  document.body.style.overflow = "";
}

function getCompareImageStyle(path: string) {
  const scale = compareScales.value[path] ?? 1;
  return { transform: `scale(${scale})` };
}

function onCompareWheel(e: WheelEvent) {
  const delta = -e.deltaY * 0.001;
  if (e.ctrlKey || e.metaKey) {
    for (const path of comparePaths.value) {
      const oldScale = compareScales.value[path] ?? 1;
      compareScales.value[path] = Math.max(COMPARE_MIN_SCALE, Math.min(COMPARE_MAX_SCALE, oldScale * (1 + delta)));
    }
  } else {
    const cell = (e.target as HTMLElement).closest(".compare-cell") as HTMLElement | null;
    if (!cell) return;
    const path = cell.dataset.path;
    if (!path) return;
    const oldScale = compareScales.value[path] ?? 1;
    compareScales.value[path] = Math.max(COMPARE_MIN_SCALE, Math.min(COMPARE_MAX_SCALE, oldScale * (1 + delta)));
  }
}

const transformStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${scale.value})`,
}));

const compareGridStyle = computed(() => {
  const count = comparePaths.value.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
  return {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${Math.ceil(count / cols)}, 1fr)`,
  };
});

onMounted(() => {
  loadPath("");
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #fafafa;
}
.app {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 24px;
}
.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.toggle-label {
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
}
.toggle-label input {
  margin: 0;
}
.content {
  min-height: calc(100vh - 120px);
}

.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  cursor: grab;
  overflow: hidden;
  user-select: none;
}
.lightbox-overlay:active {
  cursor: grabbing;
}
.lightbox-transform {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 0 0;
}
.lightbox-image {
  max-width: 95vw;
  max-height: 95vh;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

.selection-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #2c2c2c;
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  font-size: 14px;
}
.selection-count {
  color: #ccc;
}
.selection-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: #4a90d9;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.selection-btn:hover {
  background: #357abd;
}
.selection-btn.secondary {
  background: transparent;
  color: #aaa;
  border: 1px solid #555;
}
.selection-btn.secondary:hover {
  background: #3a3a3a;
  color: #fff;
}

.compare-overlay {
  position: fixed;
  inset: 0;
  background: #111;
  z-index: 2000;
}
.compare-grid {
  display: grid;
  gap: 6px;
  padding: 48px;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
}
.compare-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.compare-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  transform-origin: center center;
}
.compare-exit {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.compare-exit:hover {
  background: rgba(255, 255, 255, 0.35);
}
</style>
