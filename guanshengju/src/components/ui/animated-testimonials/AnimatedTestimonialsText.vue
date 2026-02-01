<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Motion, AnimatePresence } from "motion-v";
import { Icon } from "@iconify/vue";

const props = defineProps({
  testimonials: { type: Array, required: false, default: () => [] },
  autoplay: { type: Boolean, required: false, default: () => false },
  duration: { type: Number, required: false, default: 5000 },
});

const active = ref(0);
const interval = ref();

const activeTestimonialQuote = computed(() => {
  if (!props.testimonials[active.value]) return [];
  return props.testimonials[active.value].quote.split(" ");
});

onMounted(() => {
  if (props.autoplay) {
    interval.value = setInterval(handleNext, props.duration);
  }
});

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value);
  }
});

function handleNext() {
  active.value = (active.value + 1) % props.testimonials.length;
}

function handlePrev() {
  active.value =
    (active.value - 1 + props.testimonials.length) % props.testimonials.length;
}

function isActive(index) {
  return active.value === index;
}
</script>

<template>
  <div
    class="mx-auto w-full px-4 py-2 font-sans antialiased md:px-8 lg:px-12"
  >
    <div class="relative flex flex-col items-center">
      <!-- Fixed Position Header for Name and Designation -->
      <div class="mb-4 min-h-16 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <Motion
            :key="`${active}-header`"
            as="div"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.3 }"
            class="space-y-0.5"
          >
            <h3 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ props.testimonials[active]?.name }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {{ props.testimonials[active]?.designation }}
            </p>
          </Motion>
        </AnimatePresence>
      </div>

      <!-- Stable Height Quote Container -->
      <div class="relative w-full max-w-4xl min-h-[140px] flex items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <Motion
            :key="active"
            as="div"
            :initial="{
              y: 20,
              opacity: 0,
            }"
            :animate="{
              y: 0,
              opacity: 1,
            }"
            :exit="{
              y: -20,
              opacity: 0,
            }"
            :transition="{
              duration: 0.4,
              ease: 'easeInOut',
            }"
            class="w-full px-6"
          >
            <div class="text-xl md:text-2xl lg:text-3xl text-neutral-700 dark:text-neutral-200 italic font-semibold leading-relaxed tracking-tight">
              <Motion
                v-for="(word, index) in activeTestimonialQuote"
                :key="`${active}-${index}`"
                as="span"
                :initial="{
                  filter: 'blur(10px)',
                  opacity: 0,
                  y: 5,
                }"
                :animate="{
                  filter: 'blur(0px)',
                  opacity: 1,
                  y: 0,
                }"
                :transition="{
                  duration: 0.2,
                  ease: 'easeInOut',
                  delay: 0.02 * index,
                }"
                class="inline-block"
              >
                {{ word }}&nbsp;
              </Motion>
            </div>
          </Motion>
        </AnimatePresence>
      </div>

      <!-- Controls -->
      <div class="flex justify-center gap-8 pt-8">
        <button
          class="group/button flex size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 shadow-sm hover:shadow-md"
          @click="handlePrev"
          aria-label="Previous testimonial"
        >
          <Icon
            icon="lucide:arrow-left"
            class="size-6 text-neutral-700 dark:text-neutral-300 transition-transform duration-300 group-hover/button:-translate-x-1"
          />
        </button>
        <button
          class="group/button flex size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all duration-300 shadow-sm hover:shadow-md"
          @click="handleNext"
          aria-label="Next testimonial"
        >
          <Icon
            icon="lucide:arrow-right"
            class="size-6 text-neutral-700 dark:text-neutral-300 transition-transform duration-300 group-hover/button:translate-x-1"
          />
        </button>
      </div>
    </div>
  </div>
</template>
