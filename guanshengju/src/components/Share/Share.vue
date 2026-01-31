<template>
  <section id="share" class="min-h-screen relative bg-white dark:bg-black">
    <AnimatedSectionHeader
      bg-text="SHARING"
      title="My Sharings"
      subtitle="Some gems I found lately 📚🎬"
    />

    <div ref="content" class="max-w-7xl mx-auto px-4 opacity-0 translate-y-20">
      <!-- <Blogs />
      <Books /> -->
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
import Books from './Books.vue';
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