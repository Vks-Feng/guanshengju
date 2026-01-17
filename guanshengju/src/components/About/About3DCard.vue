<script setup lang="ts">
import { ref } from 'vue';
import CardBody from '../../components/ui/card-3d/CardBody.vue';
import CardContainer from '../../components/ui/card-3d/CardContainer.vue';
import CardItem from '../../components/ui/card-3d/CardItem.vue';
import FlipWords from '../../components/ui/flip-words/FlipWords.vue';

// 身份项数据
const identities = [
  "Whuer",
  "Alibaba Intern",
  "AI SDE & Backend Developer",
  "Photography Enthusiast",
  "Calligraphy Lover"
];

// 悬浮状态管理
const hoveredIndex = ref<number | null>(null);
</script>

<template>
  <CardContainer>
    <!-- 1. 调整了宽度 w-[90vw] sm:w-[26rem]，让卡片更紧凑 -->
    <CardBody
      class="group/card relative h-auto w-[80vw] sm:w-[27rem] rounded-3xl border border-black/[0.1] bg-gray-50/80 p-6 sm:p-10 backdrop-blur-sm dark:border-white/[0.2] dark:bg-black/80 dark:hover:shadow-2xl dark:hover:shadow-orange-500/[0.1]"
    >
      
      <!-- 装饰用的小圆点 (左下角) -->
      <div class="absolute -left-2 -bottom-2 h-12 w-12 rounded-full bg-orange-500/20 blur-xl group-hover/card:bg-orange-500/40 transition-all duration-500" />

      <!-- 第一部分：名字 -->
      <div class="flex flex-col items-start w-full">
        <CardItem
          :translate-z="20"
          class="text-base font-bold text-neutral-500 dark:text-neutral-400 font-mono"
        >
          My name is:
        </CardItem>

        <!-- 名字居中：利用 w-full + text-center -->
        <CardItem
          :translate-z="80"
          class="w-full py-8 text-center"
        >
          <div class="text-5xl sm:text-6xl font-black tracking-tighter">
            <FlipWords
              :words="['观升', 'Vks']"
              :duration="3000"
              class="!text-white"
            />
          </div>
        </CardItem>
      </div>

      <!-- 分割线 -->
      <CardItem :translate-z="30" class="w-full h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-2" />

      <!-- 第二部分：身份 -->
      <div class="mt-6 flex flex-col w-full">
        <CardItem
          :translate-z="20"
          class="text-base font-bold text-neutral-500 dark:text-neutral-400 font-mono"
        >
          I am a:
        </CardItem>

        <!-- 身份列表：右对齐 (items-end) -->
        <div class="mt-4 space-y-2 flex flex-col items-end w-full">
          <CardItem
            v-for="(item, index) in identities"
            :key="index"
            :translate-z="40"
            class="transition-all duration-300 ease-in-out cursor-default"
            :class="[
              // 悬浮逻辑：如果当前有项被悬浮，且不是自己，则变暗变模糊
              hoveredIndex !== null && hoveredIndex !== index 
                ? 'opacity-20 blur-[1px] scale-95' 
                : 'opacity-100 scale-100'
            ]"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <!-- 修复颜色消失问题：显式指定 dark:text-white，悬浮时变色 -->
            <span 
              class="text-xl sm:text-2xl font-mono font-bold text-neutral-800 dark:text-white transition-colors duration-300"
              :class="{ 'text-white dark:text-whit-500': hoveredIndex === index }"
            >
              {{ item }}
            </span>
          </CardItem>
        </div>
      </div>

      <!-- 装饰：右上角年份 -->
      <CardItem :translate-z="50" class="absolute top-6 right-8 opacity-30">
        <span class="text-[10px] font-mono dark:text-white">© 2026 VKS</span>
      </CardItem>
    </CardBody>
  </CardContainer>
</template>

<style scoped>
/* 确保 FlipWords 的颜色具有最高优先级 */
:deep(.text-primary) {
  color: #f97316 !important; /* orange-500 */
}
</style>