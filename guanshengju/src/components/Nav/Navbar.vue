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
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

const scrollTo = (id: string) => {
  gsap.to(window, {
    duration: 0.8,
    scrollTo: { y: `#${id}`, autoKill: false },
    ease: 'power2.inOut'
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
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
  <nav 
    class="sticky top-0 left-0 right-0 z-50 w-full flex justify-center px-4 pt-4 pb-1 pointer-events-none"
  >
    <div 
      class="flex items-center gap-4 sm:gap-8 md:gap-10 pointer-events-auto px-5 sm:px-8 py-2.5 rounded-full transition-all duration-500 border border-black/5 dark:border-white/5"
      :class="[
        isScrolled 
          ? 'backdrop-blur-xl bg-white/60 dark:bg-black/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)]' 
          : 'backdrop-blur-md bg-white/40 dark:bg-black/40'
      ]"
    >
      <!-- Title -->
      <h1 
        class="text-base sm:text-lg font-bold tracking-[0.15em] sm:tracking-[0.2em] text-black dark:text-white cursor-pointer select-none"
        @click="scrollTo('about')"
      >
        GUANSHENGJU
      </h1>

      <!-- Separator -->
      <div class="h-4 w-[1px] bg-black/10 dark:white/10 hidden sm:block"></div>

      <!-- Navigation Links -->
      <div class="flex items-center gap-4 sm:gap-6 md:gap-8">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="scrollTo(item.id)"
          class="group relative py-1 text-xs sm:text-sm font-medium transition-colors duration-300"
          :class="[
            activeSection === item.id 
              ? 'text-black dark:text-white' 
              : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
          ]"
        >
          {{ item.name }}
          <!-- Underline Indicator -->
          <span 
            class="absolute bottom-0 left-0 h-[1.5px] bg-black dark:bg-white transition-all duration-500 ease-out"
            :class="[
              activeSection === item.id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'
            ]"
          ></span>
        </button>
      </div>

      <!-- Separator -->
      <div class="h-4 w-[1px] bg-black/10 dark:white/10"></div>
      
      <!-- Theme Toggle -->
      <div class="flex items-center justify-center">
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* 保持简洁 */
</style>
