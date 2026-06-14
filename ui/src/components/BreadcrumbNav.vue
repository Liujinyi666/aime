<template>
  <nav class="breadcrumb">
    <button class="crumb" :class="{ active: !currentPath }" @click="$emit('navigate', '')">
      根目录
    </button>
    <template v-for="(part, i) in parts" :key="i">
      <span class="separator">/</span>
      <button class="crumb" :class="{ active: i === parts.length - 1 }" @click="$emit('navigate', part.fullPath)">
        {{ part.name }}
      </button>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ currentPath: string }>();
defineEmits<{ navigate: [path: string] }>();

const parts = computed(() => {
  if (!props.currentPath) return [];
  const segments = props.currentPath.split("/");
  const result: { name: string; fullPath: string }[] = [];
  for (let i = 0; i < segments.length; i++) {
    result.push({
      name: segments[i],
      fullPath: segments.slice(0, i + 1).join("/"),
    });
  }
  return result;
});
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}
.crumb {
  background: none;
  border: none;
  color: #1a73e8;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
}
.crumb:hover {
  background: #e3eefc;
}
.crumb.active {
  color: #333;
  cursor: default;
}
.crumb.active:hover {
  background: none;
}
.separator {
  color: #999;
}
</style>
