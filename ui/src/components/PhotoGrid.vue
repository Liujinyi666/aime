<template>
  <div class="grid">
    <div
      v-for="item in items"
      :key="item.path"
      class="item"
      @click="onClick(item)"
    >
      <div v-if="item.type === 'dir'" class="folder">
        <span class="folder-icon">📁</span>
        <span class="name">{{ item.name }}</span>
      </div>
      <div v-else class="photo">
        <img :src="`/photos/${item.path}`" :alt="item.name" loading="lazy" />
        <span class="name">{{ item.name }}</span>
      </div>
    </div>
    <div v-if="!items.length" class="empty">此目录下没有照片</div>
  </div>
</template>

<script setup lang="ts">
import type { PhotoItem } from "@/types";

defineProps<{ items: PhotoItem[] }>();
const emit = defineEmits<{
  openDir: [path: string];
}>();

function onClick(item: PhotoItem) {
  if (item.type === "dir") {
    emit("openDir", item.path);
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}
.item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
  background: #fff;
  border: 1px solid #e0e0e0;
}
.item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.folder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  height: 160px;
}
.folder-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
.photo img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
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
