<template>
  <div class="app">
    <header class="header">
      <h1 class="title">Aime</h1>
    </header>
    <BreadcrumbNav :currentPath="currentPath" @navigate="loadPath" />
    <main class="content">
      <PhotoGrid :items="items" @openDir="loadPath" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { PhotoItem } from "@/types";
import { fetchPhotos } from "@/api";
import BreadcrumbNav from "@/components/BreadcrumbNav.vue";
import PhotoGrid from "@/components/PhotoGrid.vue";

const currentPath = ref("");
const items = ref<PhotoItem[]>([]);

async function loadPath(path: string) {
  currentPath.value = path;
  try {
    const data = await fetchPhotos(path);
    items.value = data.items;
  } catch {
    items.value = [];
  }
}

onMounted(() => loadPath(""));
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
}
.title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.content {
  min-height: calc(100vh - 120px);
}
</style>
