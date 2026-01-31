<template>
  <section id="interests" class="min-h-screen relative bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
    <AnimatedSectionHeader
      bg-text="INTERESTS"
      title="My Interests"
      subtitle="Explore what I love doing! ✨"
    />

    <div ref="content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-24 opacity-0 translate-y-20">
      <Photography />
      <!-- 其他兴趣模块可以根据需要启用 -->
      <!-- <Calligraphy /> -->
      <!-- <Games /> -->
      <!-- <Music /> -->
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedSectionHeader from '../ui/AnimatedSectionHeader.vue';
import Photography from './Photography.vue';
import Calligraphy from './Calligraphy.vue';
import Games from './Games.vue';
import Music from './Music.vue';

gsap.registerPlugin(ScrollTrigger);

const content = ref(null);

onMounted(() => {
  gsap.to(content.value, {
    scrollTrigger: {
      trigger: content.value,
      start: "top 85%",
      end: "top 30%",
      toggleActions: "play none none reverse"
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power3.out"
  });
});
</script>

<style scoped>
section {
  min-height: 100vh;
}
</style>