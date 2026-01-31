<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useFullscreen } from "@vueuse/core";
import InfiniteGrid from "../ui/infinite-grid/InfiniteGrid.vue";

// 导入所有图片资产
const images = import.meta.glob("@/assets/interests/photography/Marquee/p*.jpg", {
  eager: true,
  import: "default",
});

const imageList = Object.values(images) as string[];

// 构造 CardData
const cardData = imageList.map((img, index) => ({
  title: `Photo ${index + 1}`,
  badge: "Photography",
  image: img,
  description: "A moment captured through the lens.",
  tags: ["Nature", "Snap"],
  date: "2024-2025",
}));

const el = useTemplateRef<HTMLElement>("el");
const { toggle } = useFullscreen(el);
const tilesLoaded = ref(false);

function onTilesLoaded() {
  tilesLoaded.value = true;
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col space-y-2">
      <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Photography</h2>
      <p class="text-neutral-500 dark:text-neutral-400 max-w-2xl">
        I'm a photography beginner, but I’ve been obsessed since I first picked up a camera. I look forward to continuously improving my skills. If you're interested, you can find more of my work on Xiaohongshu or Douyin.
      </p>
    </div>

    <div class="relative flex h-[32rem] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-black">
      <div
        ref="el"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden"
      >
        <InfiniteGrid
          :card-data="cardData"
          @tiles-loaded="onTilesLoaded"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="!tilesLoaded"
        class="z-20 flex flex-col items-center space-y-4"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-400 border-t-white" />
        <span class="text-lg font-medium text-white">Loading Gallery...</span>
      </div>

      <!-- Fullscreen Button -->
      <button
        v-if="tilesLoaded"
        class="absolute bottom-6 z-30 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all duration-300 active:scale-95"
        @click="toggle"
      >
        View Fullscreen
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 确保全屏时容器占满 */
:fullscreen {
  background-color: black;
  width: 100vw;
  height: 100vh;
}
</style>
