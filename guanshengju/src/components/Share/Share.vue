<template>
  <section id="share" class="min-h-screen relative border-t border-neutral-100 dark:border-neutral-800/50">
    <AnimatedSectionHeader
      bg-text="SHARING"
      title="Things I Share"
      subtitle="Worlds, stories, and screen-time favorites that stayed with me."
    />

    <div ref="content" class="max-w-7xl mx-auto px-4 pb-24 space-y-10 opacity-0 translate-y-20">
      <PlayedGames />
      <!-- <Blogs /> -->
      <Videos />
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedSectionHeader from '../ui/AnimatedSectionHeader.vue';
import Blogs from './Blogs.vue';
import PlayedGames from './PlayedGames.vue';
import Videos from './Videos.vue';

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
  width: 100%;
}
</style>
