<script setup lang="ts">
import { ref } from 'vue';
import CardBody from '../../components/ui/card-3d/CardBody.vue';
import CardContainer from '../../components/ui/card-3d/CardContainer.vue';
import CardItem from '../../components/ui/card-3d/CardItem.vue';
import FlipWords from '../../components/ui/flip-words/FlipWords.vue';

const identities = [
  'WHUer',
  'AI Native Engineer',
  'Backend Developer',
  'Photography Enthusiast',
  'Calligraphy Lover',
];

const hoveredIndex = ref<number | null>(null);
const isNameHovered = ref(false);
</script>

<template>
  <CardContainer>
    <CardBody
      class="group/card relative h-auto w-[80vw] rounded-3xl border border-black/[0.1] bg-white/80 p-6 backdrop-blur-sm dark:border-white/[0.2] dark:bg-black/80 dark:hover:shadow-2xl dark:hover:shadow-white/[0.05] sm:w-[27rem] sm:p-10"
    >
      <div class="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-neutral-500/10 blur-xl transition-all duration-500 group-hover/card:bg-neutral-500/20" />

      <div class="flex w-full flex-col items-start" style="transform-style: preserve-3d;">
        <CardItem
          :translate-z="20"
          class="font-mono text-sm font-bold text-muted-foreground"
        >
          My name is:
        </CardItem>

        <CardItem
          :translate-z="isNameHovered ? 120 : 70"
          class="w-full py-8 text-center"
          @mouseenter="isNameHovered = true"
          @mouseleave="isNameHovered = false"
        >
          <div
            class="text-5xl font-black tracking-tighter transition-all duration-500 sm:text-6xl"
            :class="{ 'scale-110': isNameHovered }"
          >
            <FlipWords
              :words="['观升', 'Vks']"
              :duration="3000"
              class="text-foreground"
            />
          </div>
        </CardItem>
      </div>

      <CardItem
        :translate-z="40"
        class="my-4 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div class="mt-6 flex w-full flex-col" style="transform-style: preserve-3d;">
        <CardItem
          :translate-z="30"
          class="font-mono text-sm font-bold text-muted-foreground"
        >
          I am a:
        </CardItem>

        <div class="mt-4 flex w-full flex-col items-end space-y-2" style="transform-style: preserve-3d;">
          <CardItem
            v-for="(item, index) in identities"
            :key="index"
            :translate-z="hoveredIndex === index ? 90 : 50"
            class="cursor-default"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <span
              class="inline-block text-xl font-mono font-bold text-foreground transition-all duration-300 sm:text-2xl"
              :class="[
                hoveredIndex === index ? 'scale-110 opacity-100' : '',
                hoveredIndex !== null && hoveredIndex !== index ? 'scale-95 opacity-20 blur-[1px]' : 'scale-100 opacity-100',
              ]"
            >
              {{ item }}
            </span>
          </CardItem>
        </div>
      </div>

      <CardItem :translate-z="50" class="absolute right-8 top-6 opacity-30">
        <span class="text-[10px] text-foreground font-mono">© 2026 VKS</span>
      </CardItem>
    </CardBody>
  </CardContainer>
</template>

<style scoped>
</style>
