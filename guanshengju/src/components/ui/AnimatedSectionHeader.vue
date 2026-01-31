<template>
  <div ref="container" class="relative w-full pt-24 pb-52 flex flex-col items-center justify-center overflow-hidden select-none">
    <!-- Background Text -->
    <div
      ref="bgTextEl"
      class="absolute top-1/2 left-1/2 w-full text-[12rem] leading-none font-black opacity-0 pointer-events-none z-0 text-center whitespace-nowrap"
      :class="bgTextClass"
    >
      {{ bgText }}
    </div>

    <!-- Foreground Content -->
    <div class="relative z-10 text-center px-4">
      <h2 ref="titleEl" class="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 opacity-0 translate-y-10">
        {{ title }}
      </h2>
      <p ref="subtitleEl" class="text-xl text-primary font-medium italic opacity-0 translate-y-5">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  bgText: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  bgTextClass: {
    type: String,
    default: 'text-gray-200 dark:text-neutral-800'
  }
});

const container = ref(null);
const bgTextEl = ref(null);
const titleEl = ref(null);
const subtitleEl = ref(null);

onMounted(() => {
  // Initial set for centering
  gsap.set(bgTextEl.value, {
    xPercent: -50,
    yPercent: -50,
    y: 20 // start slightly lower for entrance effect
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container.value,
      start: "top 80%",
      end: "top 20%",
      toggleActions: "play none none reverse"
    }
  });

  tl.to(bgTextEl.value, {
    opacity: 0.5,
    y: 0, // animate to centered position
    duration: 1,
    ease: "power3.out"
  })
  .to(titleEl.value, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "back.out(1.7)"
  }, "-=0.5")
  .to(subtitleEl.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.4");

  // Parallax effect for background text
  // Animate y independently from yPercent
  gsap.to(bgTextEl.value, {
    scrollTrigger: {
      trigger: container.value,
      start: "top bottom",
      end: "bottom top",
      scrub: 1
    },
    y: 100, // Move 100px relative to current position
    ease: "none"
  });
});
</script>
