<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThemeToggle from '../ui/ThemeToggle.vue';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const navItems = [
  { name: 'About', id: 'about' },
  { name: 'Interests', id: 'interests' },
  { name: 'Share', id: 'share' }
];

const activeSection = ref('about');

const scrollTo = (id: string) => {
  gsap.to(window, {
    duration: 0.8,
    scrollTo: { y: `#${id}`, autoKill: false },
    ease: 'power2.inOut'
  });
};

onMounted(() => {
  navItems.forEach((item) => {
    ScrollTrigger.create({
      trigger: `#${item.id}`,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => activeSection.value = item.id,
      onEnterBack: () => activeSection.value = item.id,
    });
  });
});
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 pointer-events-none">
    <div class="flex items-center gap-12 pointer-events-auto">
      <!-- Title -->
      <h1 
        class="text-xl font-bold tracking-[0.2em] text-black dark:text-white cursor-pointer select-none"
        @click="scrollTo('about')"
      >
        GUANSHENGJU
      </h1>

      <!-- Navigation Links -->
      <div class="flex items-center gap-8">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="scrollTo(item.id)"
          class="group relative py-1 text-sm font-medium transition-colors duration-300"
          :class="[
            activeSection === item.id 
              ? 'text-black dark:text-white' 
              : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
          ]"
        >
          {{ item.name }}
          <!-- Underline Indicator -->
          <span 
            class="absolute bottom-0 left-0 h-[2px] bg-black dark:bg-white transition-all duration-500 ease-out"
            :class="[
              activeSection === item.id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'
            ]"
          ></span>
        </button>
      </div>
    </div>
    
    <div class="pointer-events-auto">
      <ThemeToggle />
    </div>
  </nav>
</template>

<style scoped>
/* 保持简洁 */
</style>
