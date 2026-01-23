<script setup lang="ts">
import { ref } from "vue";
import { Marquee } from "../ui/marquee";
import ReviewCard from "../ui/marquee/ReviewCard.vue";

// 导入本地图片资产
// 注意：Vite 会处理这些路径
import p1 from "@/assets/interests/photography/Marquee/p1.jpg";
import p2 from "@/assets/interests/photography/Marquee/p2.jpg";
import p3 from "@/assets/interests/photography/Marquee/p3.jpg";
import p4 from "@/assets/interests/photography/Marquee/p4.jpg";
import p5 from "@/assets/interests/photography/Marquee/p5.jpg";
import p6 from "@/assets/interests/photography/Marquee/p6.jpg";
import p7 from "@/assets/interests/photography/Marquee/p7.jpg";
import p8 from "@/assets/interests/photography/Marquee/p8.jpg";

const localImages = [p1, p2, p3, p4, p5, p6, p7, p8];

// 构造图片数据
const photos = localImages.map((img) => ({
  img: img,
}));

// 为了让两排看起来内容更丰富且不完全重复，我们可以对第二排进行简单的重排
const firstRow = ref(photos.slice(0, 4));
const secondRow = ref(photos.slice(4, 8));
</script>

<template>
  <div
    class="bg-background relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border md:shadow-xl"
  >
    <!-- 第一行跑马灯 -->
    <Marquee
      class="[--duration:40s]"
    >
      <ReviewCard
        v-for="(photo, index) in firstRow"
        :key="`row1-${index}`"
        :img="photo.img"
        name=""
        username=""
        body=""
      />
    </Marquee>

    <!-- 第二行跑马灯 (反向) -->
    <Marquee
      reverse
      class="[--duration:40s]"
    >
      <ReviewCard
        v-for="(photo, index) in secondRow"
        :key="`row2-${index}`"
        :img="photo.img"
        name=""
        username=""
        body=""
      />
    </Marquee>

    <!-- 左右渐变遮罩，增强视觉效果 -->
    <div
      class="dark:from-background pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white"
    />
    <div
      class="dark:from-background pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white"
    />
  </div>
</template>
