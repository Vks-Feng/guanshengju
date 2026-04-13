<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThemeToggle from '../ui/ThemeToggle.vue';

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const sectionItems = [
  { name: 'About', id: 'about' },
  { name: 'Interests', id: 'interests' },
  { name: 'Share', id: 'share' }
];

const route = useRoute();
const router = useRouter();
const activeSection = ref('about');
const isScrolled = ref(false);
const sectionTriggers = [];

const isHomeRoute = computed(() => route.name === 'Home');
const isBlogRoute = computed(() => route.name === 'BlogIndex' || route.name === 'BlogPost');
const activeKey = computed(() => (isBlogRoute.value ? 'blog' : activeSection.value));

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

const clearSectionTriggers = () => {
  while (sectionTriggers.length > 0) {
    sectionTriggers.pop()?.kill();
  }
};

const syncSectionTracking = async () => {
  clearSectionTriggers();

  if (!isHomeRoute.value) {
    activeSection.value = isBlogRoute.value ? 'blog' : 'about';
    return;
  }

  await nextTick();
  handleScroll();

  if (route.hash) {
    activeSection.value = route.hash.replace('#', '') || 'about';
  } else {
    activeSection.value = 'about';
  }

  sectionItems.forEach((item) => {
    const sectionEl = document.querySelector(`#${item.id}`);
    if (!sectionEl) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        if (isHomeRoute.value) {
          activeSection.value = item.id;
        }
      },
      onEnterBack: () => {
        if (isHomeRoute.value) {
          activeSection.value = item.id;
        }
      },
    });

    sectionTriggers.push(trigger);
  });

  ScrollTrigger.refresh();
};

const goHome = () => {
  if (isHomeRoute.value) {
    activeSection.value = 'about';
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: 0, autoKill: false },
      ease: 'power2.inOut'
    });
    return;
  }

  router.push({ path: '/' });
};

const navigateToSection = (id) => {
  if (!isHomeRoute.value) {
    router.push({ path: '/', hash: `#${id}` });
    return;
  }

  activeSection.value = id;
  gsap.to(window, {
    duration: 0.8,
    scrollTo: { y: `#${id}`, autoKill: false },
    ease: 'power2.inOut'
  });
};

const openBlog = async () => {
  if (!isBlogRoute.value) {
    await router.push({ name: 'BlogIndex' });
    return;
  }

  gsap.to(window, {
    duration: 0.65,
    scrollTo: { y: 0, autoKill: false },
    ease: 'power2.out'
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

watch(
  () => route.fullPath,
  () => {
    syncSectionTracking();
  },
  { immediate: true }
);

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  clearSectionTriggers();
});
</script>

<template>
  <nav
    class="pointer-events-none fixed inset-x-0 top-0 z-50 flex w-full justify-center px-4 pb-1 pt-4"
  >
    <div
      class="pointer-events-auto flex items-center gap-4 rounded-full border border-black/5 px-5 py-2.5 transition-all duration-500 dark:border-white/5 sm:gap-8 sm:px-8 md:gap-10"
      :class="[
        isScrolled
          ? 'bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:bg-black/60 dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)]'
          : 'bg-white/40 backdrop-blur-md dark:bg-black/40'
      ]"
    >
      <h1
        class="cursor-pointer select-none text-base font-bold tracking-[0.15em] text-black dark:text-white sm:text-lg sm:tracking-[0.2em]"
        @click="goHome"
      >
        GUANSHENGJU
      </h1>

      <div class="hidden h-4 w-[1px] bg-black/10 sm:block dark:bg-white/10"></div>

      <div class="flex items-center gap-4 sm:gap-6 md:gap-8">
        <button
          v-for="item in sectionItems"
          :key="item.id"
          @click="navigateToSection(item.id)"
          class="group relative py-1 text-xs font-medium transition-colors duration-300 sm:text-sm"
          :class="[
            activeKey === item.id
              ? 'text-black dark:text-white'
              : 'text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white'
          ]"
        >
          {{ item.name }}
          <span
            class="absolute bottom-0 left-0 h-[1.5px] bg-black transition-all duration-500 ease-out dark:bg-white"
            :class="[
              activeKey === item.id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'
            ]"
          ></span>
        </button>

        <RouterLink
          :to="{ name: 'BlogIndex' }"
          @click.prevent="openBlog"
          class="group relative py-1 text-xs font-medium transition-colors duration-300 sm:text-sm"
          :class="[
            activeKey === 'blog'
              ? 'text-black dark:text-white'
              : 'text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white'
          ]"
        >
          Blog
          <span
            class="absolute bottom-0 left-0 h-[1.5px] bg-black transition-all duration-500 ease-out dark:bg-white"
            :class="[
              activeKey === 'blog' ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50'
            ]"
          ></span>
        </RouterLink>
      </div>

      <div class="h-4 w-[1px] bg-black/10 dark:bg-white/10"></div>

      <div class="flex items-center justify-center">
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* 保持简洁 */
</style>
