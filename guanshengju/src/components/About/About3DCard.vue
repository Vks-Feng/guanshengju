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
const isNameHovered = ref(false);
</script>

<template>
  <CardContainer>
    <!-- 1. 调整了宽度 w-[90vw] sm:w-[26rem]，让卡片更紧凑 -->
    <CardBody
      class="group/card relative h-auto w-[80vw] sm:w-[27rem] rounded-3xl border border-black/[0.1] bg-white/80 dark:bg-black/80 p-6 sm:p-10 backdrop-blur-sm dark:border-white/[0.2] dark:hover:shadow-2xl dark:hover:shadow-white/[0.05]"
    >
      
      <!-- 装饰用的小圆点 (左下角) -->
      <div class="absolute -left-2 -bottom-2 h-12 w-12 rounded-full bg-neutral-500/10 blur-xl group-hover/card:bg-neutral-500/20 transition-all duration-500" />

      <!-- 第一部分：名字 -->
      <div class="flex flex-col items-start w-full" style="transform-style: preserve-3d;">
        <CardItem
          :translate-z="20"
          class="text-sm font-bold text-muted-foreground font-mono"
        >
          My name is:
        </CardItem>

        <!-- 名字居中：利用 w-full + text-center -->
        <CardItem
          :translate-z="isNameHovered ? 120 : 70"
          class="w-full py-8 text-center"
          @mouseenter="isNameHovered = true"
          @mouseleave="isNameHovered = false"
        >
          <div class="text-5xl sm:text-6xl font-black tracking-tighter transition-all duration-500" :class="{ 'scale-110': isNameHovered }">
            <FlipWords
              :words="['观升', 'Vks']"
              :duration="3000"
              class="text-foreground"
            />
          </div>
        </CardItem>
      </div>

      <!-- 分割线 -->
      <CardItem :translate-z="40" class="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

      <!-- 第二部分：身份 -->
      <div class="mt-6 flex flex-col w-full" style="transform-style: preserve-3d;">
        <CardItem
          :translate-z="30"
          class="text-sm font-bold text-muted-foreground font-mono"
        >
          I am a:
        </CardItem>

        <!-- 身份列表：右对齐 (items-end) -->
        <div class="mt-4 space-y-2 flex flex-col items-end w-full" style="transform-style: preserve-3d;">
          <CardItem
            v-for="(item, index) in identities"
            :key="index"
            :translate-z="hoveredIndex === index ? 90 : 50"
            class="cursor-default"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <!-- 移除橙色悬浮，保持黑白基调 -->
            <span 
              class="text-xl sm:text-2xl font-mono font-bold text-foreground transition-all duration-300 inline-block"
              :class="[
                hoveredIndex === index ? 'scale-110 opacity-100' : '',
                hoveredIndex !== null && hoveredIndex !== index ? 'opacity-20 blur-[1px] scale-95' : 'opacity-100 scale-100'
              ]"
            >
              {{ item }}
            </span>
          </CardItem>
        </div>
      </div>

      <!-- 装饰：右上角年份 -->
      <CardItem :translate-z="50" class="absolute top-6 right-8 opacity-30">
        <span class="text-[10px] font-mono text-foreground">© 2026 VKS</span>
      </CardItem>
    </CardBody>
  </CardContainer>
</template>

<style scoped>
/* 保持简洁的黑白基调 */
</style>