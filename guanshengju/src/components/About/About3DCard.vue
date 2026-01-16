<script setup lang="ts">
import CardBody from '../../components/ui/card-3d/CardBody.vue';
import CardContainer from '../../components/ui/card-3d/CardContainer.vue';
import CardItem from '../../components/ui/card-3d/CardItem.vue';
import FlipWords from '../../components/ui/flip-words/FlipWords.vue';

interface Props {
  title?: {
    translateX?: number;
    translateY?: number;
    translateZ?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
  };
  description?: {
    translateX?: number;
    translateY?: number;
    translateZ?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
  };
  image?: {
    translateX?: number;
    translateY?: number;
    translateZ?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
  };
  btnLeft?: {
    translateX?: number;
    translateY?: number;
    translateZ?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
  };
  btnRight?: {
    translateX?: number;
    translateY?: number;
    translateZ?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  title: () => ({
    translateX: 0,
    translateY: 0,
    translateZ: 50,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  }),
  description: () => ({
    translateX: 0,
    translateY: 0,
    translateZ: 60,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  }),
  image: () => ({
    translateX: 0,
    translateY: 0,
    translateZ: 100,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  }),
  btnLeft: () => ({
    translateX: 0,
    translateY: 0,
    translateZ: 20,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  }),
  btnRight: () => ({
    translateX: 0,
    translateY: 0,
    translateZ: 20,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  }),
});
</script>

<template>
  <CardContainer>
    <CardBody
      class="group/card relative h-auto w-fit rounded-xl border border-black/[0.1] bg-gray-50 p-6 sm:w-[30rem] dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]"
    >
      <!-- Name Section -->
      <CardItem
        v-bind="props.title"
        class="text-xl font-bold text-white-600 dark:text-white font-mono"
      >
        My Name is
        <br />
        <div class="mx-auto text-4xl font-normal text-white-600 dark:text-white-400">
          <FlipWords
            :words="['观升', 'Vks']"
            :duration="2000"
            class="!text-primary text-5xl font-bold"
          />
        </div>

      </CardItem>

      <!-- Divider Line -->
      <div class="my-4 h-px w-full bg-neutral-300 dark:bg-neutral-700"></div>

      <!-- "I am a" header (left-aligned like "My Name is") -->
      <CardItem
        v-bind="props.description"
        class="text-xl font-bold text-white-600 dark:text-white font-mono"
      >
        I am a
      </CardItem>

      <!-- Identity items (right-aligned, mono font, larger & whiter) -->
      <CardItem
        v-bind="props.description"
        class="mt-2 max-w-sm font-mono text-[22px] leading-relaxed"
      >
        <div class="space-y-1.5">
          <div class="text-neutral-700 dark:text-neutral-200">Whuer</div>
          <div class="text-neutral-700 dark:text-neutral-200">Alibaba Intern</div>
          <div class="text-neutral-700 dark:text-neutral-200">Backend Developer</div>
          <div class="text-neutral-700 dark:text-neutral-200">AI Software Developer</div>
          <div class="text-neutral-700 dark:text-neutral-200">Cat Lover</div>
          <div class="text-neutral-700 dark:text-neutral-200">Photography Enthusiast</div>
          <div class="text-neutral-700 dark:text-neutral-200">Calligraphy Lover</div>
          <div class="text-neutral-700 dark:text-neutral-200">Gaming Enthusiast</div>
          <div class="text-neutral-700 dark:text-neutral-200">Billiards Enthusiast</div>
        </div>
      </CardItem>
    </CardBody>
  </CardContainer>
</template>