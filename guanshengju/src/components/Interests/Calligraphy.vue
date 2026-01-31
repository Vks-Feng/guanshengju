<script setup lang="ts">
import { ref } from "vue";
import { Marquee } from "../ui/marquee";
import CalligraphyCard from "./CalligraphyCard.vue";

// Import local assets
import yanAvatar from "@/assets/interests/calligraphy/yanzhenqing_avatar.jpg";
import yanWork from "@/assets/interests/calligraphy/yanzhenqing_work.jpg";
import zhaoAvatar from "@/assets/interests/calligraphy/zhaomengfu_avatar.jpg";
import zhaoWork from "@/assets/interests/calligraphy/zhaomengfu_work.jpg";
import wangAvatar from "@/assets/interests/calligraphy/wangxizhi_avatar.jpg";
import wangWork from "@/assets/interests/calligraphy/wangxizhi_work.jpg";
import liuAvatar from "@/assets/interests/calligraphy/liugongquan_avatar.jpg";
import liuWork from "@/assets/interests/calligraphy/liugongquan_work.png";

// Define the calligrapher data
const calligraphers = [
  {
    name: "Yan Zhenqing",
    username: "@Tang Dynasty",
    body: "Renowned for the 'Yan Style', characterized by its majestic, upright, and muscular strokes. His work reflects a strong moral character.",
    img: yanAvatar,
    workImg: yanWork,
  },
  {
    name: "Zhao Mengfu",
    username: "@Yuan Dynasty",
    body: "A versatile master of the Yuan Dynasty. His calligraphy is known for its elegance, fluidity, and adherence to classical traditions.",
    img: zhaoAvatar,
    workImg: zhaoWork,
  },
  {
    name: "Wang Xizhi",
    username: "@Jin Dynasty",
    body: "The 'Sage of Calligraphy'. Famous for the 'Orchid Pavilion Preface' (Lantingji Xu). His style is graceful and natural.",
    img: wangAvatar,
    workImg: wangWork,
  },
  {
    name: "Liu Gongquan",
    username: "@Tang Dynasty",
    body: "Famous for the 'Liu Style', known for its bony, rigid structure and strict discipline. Often peered with Yan Zhenqing as 'Yan-Liu'.",
    img: liuAvatar,
    workImg: liuWork,
  },
];

// Split into two rows (duplicating to fill space if needed, or just single row if preferred, but user asked for "一排4个卡片", let's make one row repeated)
// User requirement: "放一排4个卡片" (Put a row of 4 cards)
// But to make it a marquee that flows, we usually loop them.
// Let's create one row that scrolls.

const firstRow = ref(calligraphers);
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col space-y-2">
       <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Calligraphy</h2>
       <p class="text-neutral-500 dark:text-neutral-400 max-w-2xl">
         I have a deep passion for Chinese calligraphy. Although my own skills are still a work in progress, I find great inspiration in the masters. Here are four of my favorite calligraphers whose works I admire.
       </p>
    </div>

    <div
      class="bg-background relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border md:shadow-xl"
    >
      <!-- Marquee -->
      <!-- repeat=4 to ensure it fills the width and loops smoothly since we only have 4 items -->
      <Marquee
        pause-on-hover
        class="[--duration:40s]"
        :repeat="4"
      >
        <CalligraphyCard
          v-for="item in firstRow"
          :key="item.name"
          :img="item.img"
          :name="item.name"
          :username="item.username"
          :body="item.body"
          :workImg="item.workImg"
        />
      </Marquee>

      <!-- Left Gradient -->
      <div
        class="dark:from-background pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white"
      />

      <!-- Right Gradient -->
      <div
        class="dark:from-background pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white"
      />
    </div>
  </div>
</template>
