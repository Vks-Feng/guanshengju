<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import {
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Camera,
  GraduationCap,
  PenTool,
  Trophy,
} from 'lucide-vue-next';

const viewport = ref(null);
const trackRef = ref(null);
const slideRefs = ref([]);
const stationRefs = ref([]);
const activeIndex = ref(0);
const isDragging = ref(false);
const layoutVersion = ref(0);
const progressInsetRatio = 0.38;

let pointerStartX = 0;
let startScrollLeft = 0;
let dragMoved = false;
let layoutFrame = 0;
let resizeObserver;

const timeline = [
  {
    year: '2023',
    title: 'University Begins',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.26)',
    entries: [
      {
        label: 'Academics',
        text: 'I entered the School of Computer Science at Wuhan University as a Software Engineering student.',
        icon: GraduationCap,
      },
      {
        label: 'Interests',
        text: 'Billiards quietly became one of the things I loved most after class.',
        icon: Trophy,
      },
    ],
  },
  {
    year: '2024',
    title: 'Foundations First',
    accent: '#34d399',
    glow: 'rgba(52, 211, 153, 0.26)',
    entries: [
      {
        label: 'Academics',
        text: 'I spent a lot of time strengthening my computer science fundamentals.',
        icon: BookOpen,
      },
      {
        label: 'Career Direction',
        text: 'Backend development became the direction I wanted to pursue more seriously.',
        icon: BriefcaseBusiness,
      },
      {
        label: 'Interests',
        text: 'Calligraphy became a quiet and unexpectedly important part of my life.',
        icon: PenTool,
      },
      {
        label: 'Friendship',
        text: 'I met many wonderful friends in college, and their ideas deeply shaped my mind, worldview, and way of thinking.',
        icon: Trophy,
      },
    ],
  },
  {
    year: '2025',
    title: 'First Internship',
    accent: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.26)',
    entries: [
      {
        label: 'Career',
        text: 'I started my first internship at Alibaba as an AI Application Engineer.',
        icon: BriefcaseBusiness,
      },
      {
        label: 'Learning',
        text: 'I started learning the AI-native engineering stack, covering areas like agents, memory, and RAG.',
        icon: BrainCircuit,
      },
      {
        label: 'Interests',
        text: 'Photography became a new way for me to observe light, space, and moments.',
        icon: Camera,
      },
      {
        label: 'Lifestyle',
        text: 'Teammates from my internship encouraged me into the gym, and I began building a real fitness habit.',
        icon: Trophy,
      },
    ],
  },
  {
    year: '2026',
    title: 'The Next Chapter Ahead',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.26)',
    entries: [
      {
        label: 'Offer',
        text: 'I have received an offer from ByteDance and will soon begin my next backend internship there.',
        icon: BriefcaseBusiness,
      },
      {
        label: 'Growth',
        text: 'I hope to keep improving both my backend engineering ability and my AI Native capability.',
        icon: BrainCircuit,
      },
      {
        label: 'Goals',
        text: 'I hope to do well in autumn recruitment.',
        icon: BookOpen,
      },
      {
        label: 'Lifestyle',
        text: 'I hope to build a healthier year with more reading, more training, and steadier interests.',
        icon: Trophy,
      },
    ],
  },
];

function getCenterX(element) {
  const track = trackRef.value;
  if (!element || !track) return null;

  const trackRect = track.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return rect.left - trackRect.left + rect.width / 2;
}

const axisBaseStyle = computed(() => {
  layoutVersion.value;

  const first = stationRefs.value[0];
  const last = stationRefs.value[timeline.length - 1];
  const firstCenter = getCenterX(first);
  const lastCenter = getCenterX(last);

  if (firstCenter == null || lastCenter == null) {
    return {
      left: '0px',
      width: '0px',
      opacity: 0,
    };
  }

  return {
    left: `${firstCenter}px`,
    width: `${Math.max(lastCenter - firstCenter, 2)}px`,
    opacity: 1,
  };
});

const axisGlowStyle = computed(() => {
  layoutVersion.value;

  const first = stationRefs.value[0];
  const current = stationRefs.value[activeIndex.value];
  const firstCenter = getCenterX(first);
  const currentCenter = getCenterX(current);

  if (firstCenter == null || currentCenter == null) {
    return {
      left: '0px',
      width: '0px',
      opacity: 0,
    };
  }

  const startInset = first ? first.offsetWidth * progressInsetRatio : 0;
  const endInset = current ? current.offsetWidth * progressInsetRatio : 0;
  const left = firstCenter + startInset;
  const width = Math.max(currentCenter - endInset - left, 0);

  return {
    left: `${left}px`,
    width: `${width}px`,
    opacity: width > 0 ? 1 : 0,
  };
});

function setSlideRef(el, index) {
  if (el) {
    slideRefs.value[index] = el;
  }
}

function setStationRef(el, index) {
  stationRefs.value[index] = el ?? null;
}

function panelStyle(index) {
  const distance = Math.abs(activeIndex.value - index);

  if (distance === 0) {
    return {
      transform: 'translateZ(0px) scale(1) translateY(0px)',
      opacity: 1,
      filter: 'blur(0px)',
    };
  }

  if (distance === 1) {
    return {
      transform: 'translateZ(-72px) scale(0.93) translateY(18px)',
      opacity: 0.5,
      filter: 'blur(0.4px)',
    };
  }

  return {
    transform: 'translateZ(-130px) scale(0.86) translateY(26px)',
    opacity: 0.18,
    filter: 'blur(1.4px)',
  };
}

function updateActiveIndex() {
  const el = viewport.value;
  if (!el || !slideRefs.value.length) return;

  const viewportCenter = el.scrollLeft + el.clientWidth / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  slideRefs.value.forEach((slide, index) => {
    if (!slide) return;
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(slideCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  activeIndex.value = closestIndex;
}

function scrollToIndex(index, behavior = 'smooth') {
  const el = viewport.value;
  const target = slideRefs.value[index];
  if (!el || !target) return;

  const targetLeft = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
  const maxScrollLeft = Math.max(el.scrollWidth - el.clientWidth, 0);

  el.scrollTo({
    left: Math.min(Math.max(targetLeft, 0), maxScrollLeft),
    behavior,
  });
}

function handlePanelClick(index) {
  if (dragMoved) return;
  scrollToIndex(index);
}

function handleWheel(event) {
  const el = viewport.value;
  if (!el) return;

  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    return;
  }

  const atStart = el.scrollLeft <= 0;
  const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

  if ((atStart && event.deltaY < 0) || (atEnd && event.deltaY > 0)) {
    return;
  }

  event.preventDefault();
  el.scrollBy({
    left: event.deltaY * 0.9,
    behavior: 'smooth',
  });
}

function handlePointerDown(event) {
  const el = viewport.value;
  if (!el) return;

  isDragging.value = true;
  dragMoved = false;
  pointerStartX = event.clientX;
  startScrollLeft = el.scrollLeft;
  el.setPointerCapture?.(event.pointerId);
}

function handlePointerMove(event) {
  const el = viewport.value;
  if (!el || !isDragging.value) return;

  const deltaX = event.clientX - pointerStartX;
  if (Math.abs(deltaX) > 6) {
    dragMoved = true;
  }

  el.scrollLeft = startScrollLeft - deltaX;
}

function handlePointerUp(event) {
  const el = viewport.value;
  if (!el) return;

  isDragging.value = false;
  el.releasePointerCapture?.(event.pointerId);
  requestAnimationFrame(() => {
    updateActiveIndex();
    scrollToIndex(activeIndex.value);
  });
}

function handleScroll() {
  updateActiveIndex();
}

function syncLayout() {
  cancelAnimationFrame(layoutFrame);
  layoutFrame = requestAnimationFrame(() => {
    layoutVersion.value += 1;
  });
}

onMounted(() => {
  const el = viewport.value;
  if (!el) return;

  el.addEventListener('wheel', handleWheel, { passive: false });
  el.addEventListener('scroll', handleScroll, { passive: true });

  resizeObserver = new ResizeObserver(() => {
    syncLayout();
  });

  resizeObserver.observe(el);
  if (trackRef.value) {
    resizeObserver.observe(trackRef.value);
  }

  nextTick(() => {
    syncLayout();
    requestAnimationFrame(() => {
      updateActiveIndex();
      scrollToIndex(0, 'auto');
    });
  });
});

onUnmounted(() => {
  const el = viewport.value;
  if (el) {
    el.removeEventListener('wheel', handleWheel);
    el.removeEventListener('scroll', handleScroll);
  }

  resizeObserver?.disconnect();
  cancelAnimationFrame(layoutFrame);
});
</script>

<template>
  <section class="journey-shell">
    <div class="header">
      <div>
        <p class="eyebrow">Recent Years</p>
        <h2 class="title">Growth Timeline</h2>
        <p class="subtitle">
          Swipe, drag, or scroll through the recent years that shaped my studies, work, and interests.
        </p>
      </div>
    </div>

    <div class="timeline-stage">
      <div
        ref="viewport"
        class="timeline-viewport"
        :class="{ 'is-dragging': isDragging }"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
      >
        <div ref="trackRef" class="timeline-track">
          <div class="axis-aura" :style="axisBaseStyle" />
          <div class="axis-base" :style="axisBaseStyle" />
          <div class="axis-progress-aura" :style="axisGlowStyle" />
          <div class="axis-glow" :style="axisGlowStyle" />

          <article
            v-for="(item, index) in timeline"
            :key="item.year"
            :ref="(el) => setSlideRef(el, index)"
            class="year-panel"
            :class="{ 'is-active': index === activeIndex }"
            :style="{
              '--year-accent': item.accent,
              '--year-glow': item.glow,
              ...panelStyle(index),
            }"
            @click="handlePanelClick(index)"
          >
            <div class="year-head">
              <div :ref="(el) => setStationRef(el, index)" class="year-dot-wrap">
                <div class="year-dot" />
              </div>
              <div class="year-copy">
                <p class="year-label">{{ item.year }}</p>
                <p class="year-title">{{ item.title }}</p>
              </div>
            </div>

            <div class="year-flow">
              <div
                v-for="entry in item.entries"
                :key="`${item.year}-${entry.label}`"
                class="flow-item"
              >
                <div class="flow-node">
                  <component :is="entry.icon" class="size-4" />
                </div>

                <div class="flow-copy">
                  <p class="flow-label">{{ entry.label }}</p>
                  <p class="flow-text">{{ entry.text }}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.journey-shell {
  width: min(92%, 1520px);
  margin: 1rem auto 2rem;
  border-radius: 2rem;
  padding: 2.5rem;
  border: 1px solid var(--border);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.journey-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 8%, rgba(255, 255, 255, 0.06), transparent 20%),
    radial-gradient(circle at 88% 90%, rgba(255, 255, 255, 0.04), transparent 20%);
  pointer-events: none;
}

.header,
.timeline-stage {
  position: relative;
  z-index: 1;
}

.header {
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.65rem;
  font-size: 0.8rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--muted-foreground);
  font-weight: 600;
}

.title {
  font-size: 2.5rem;
  margin: 0;
  color: var(--foreground);
  font-family: ui-serif, Georgia, serif;
}

.subtitle {
  color: var(--muted-foreground);
  margin: 0.6rem 0 0;
  font-size: 1.05rem;
  max-width: 56rem;
  line-height: 1.8;
}

.timeline-stage {
  perspective: 1800px;
}

.timeline-viewport {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
}

.timeline-viewport::-webkit-scrollbar {
  display: none;
}

.timeline-viewport.is-dragging {
  cursor: grabbing;
}

.timeline-track {
  --axis-y: 2.1rem;
  --panel-width: min(23rem, calc(100vw - 7rem));
  position: relative;
  display: flex;
  gap: 3rem;
  width: max-content;
  min-height: 24rem;
  padding-bottom: 0.75rem;
  padding-inline: max(1rem, calc(50% - var(--panel-width) / 2));
  transform-style: preserve-3d;
}

.axis-aura,
.axis-base,
.axis-progress-aura,
.axis-glow {
  position: absolute;
  top: var(--axis-y);
  transform: translateY(-50%);
  border-radius: 9999px;
  pointer-events: none;
}

.axis-aura {
  height: 16px;
  background: linear-gradient(
    90deg,
    rgba(84, 184, 255, 0.16),
    rgba(57, 208, 176, 0.14),
    rgba(251, 114, 153, 0.14),
    rgba(247, 184, 75, 0.16)
  );
  filter: blur(14px);
  opacity: 0.72;
  z-index: 0;
}

.axis-base {
  height: 6px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--foreground) 28%, var(--background) 72%),
    color-mix(in srgb, var(--foreground) 20%, var(--background) 80%)
  );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--background) 82%, transparent),
    0 0 0 1px color-mix(in srgb, var(--foreground) 8%, transparent);
  opacity: 1;
  z-index: 1;
}

.axis-progress-aura {
  height: 12px;
  background: linear-gradient(
    90deg,
    rgba(84, 184, 255, 0.34),
    rgba(57, 208, 176, 0.3),
    rgba(251, 114, 153, 0.28),
    rgba(247, 184, 75, 0.32)
  );
  filter: blur(10px);
  opacity: 1;
  transition:
    left 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 2;
}

.axis-glow {
  height: 6px;
  background: linear-gradient(
    90deg,
    #54b8ff,
    #39d0b0,
    #fb7299,
    #f7b84b
  );
  box-shadow:
    0 0 18px rgba(84, 184, 255, 0.22),
    0 0 24px rgba(251, 114, 153, 0.14);
  transition:
    left 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 3;
}

.year-panel {
  width: var(--panel-width);
  flex: 0 0 auto;
  scroll-snap-align: center;
  position: relative;
  padding-top: 0.1rem;
  z-index: 4;
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.45s ease,
    filter 0.45s ease;
}

.year-panel.is-active .year-dot-wrap {
  transform: scale(1.08);
  border-color: color-mix(in srgb, var(--year-accent) 72%, transparent);
}

.year-panel.is-active .year-dot-wrap::before {
  opacity: 1;
  transform: scale(1);
}

.year-panel:not(.is-active) .year-dot-wrap {
  transform: scale(0.94);
  opacity: 0.76;
}

.year-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 4rem;
}

.year-dot-wrap {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--year-accent) 56%, transparent);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s ease,
    border-color 0.35s ease;
}

.year-dot-wrap::before {
  content: '';
  position: absolute;
  inset: -0.65rem;
  border-radius: inherit;
  background: radial-gradient(circle, var(--year-glow) 0%, transparent 72%);
  opacity: 0.48;
  transform: scale(0.86);
  filter: blur(8px);
  transition:
    opacity 0.45s ease,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: -1;
}

.year-dot {
  width: 0.66rem;
  height: 0.66rem;
  border-radius: 9999px;
  background: var(--year-accent);
  box-shadow: 0 0 12px var(--year-glow);
}

.year-copy {
  min-width: 0;
}

.year-label {
  margin: 0;
  font-size: 0.88rem;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--foreground) 82%, transparent);
  font-weight: 700;
  transition: color 0.4s ease;
}

.year-title {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--muted-foreground);
  transition: color 0.4s ease;
}

.year-flow {
  position: relative;
  display: grid;
  gap: 1.25rem;
  margin-top: 1.5rem;
  padding-left: 0.1rem;
}

.year-flow::before {
  content: '';
  position: absolute;
  left: 1.18rem;
  top: 0.2rem;
  bottom: 0.2rem;
  width: 1px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--year-accent) 48%, transparent),
    transparent
  );
}

.flow-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.flow-node {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--year-accent) 34%, transparent);
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: color-mix(in srgb, var(--foreground) 92%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.flow-copy {
  padding-top: 0.12rem;
}

.flow-label {
  margin: 0;
  font-size: 0.76rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--foreground) 74%, transparent);
  font-weight: 700;
}

.flow-text {
  margin: 0.45rem 0 0;
  font-size: 0.96rem;
  line-height: 1.85;
  color: color-mix(in srgb, var(--foreground) 92%, transparent);
  max-width: 20rem;
}

.year-panel:not(.is-active) .year-label {
  color: color-mix(in srgb, var(--foreground) 42%, transparent);
}

.year-panel:not(.is-active) .year-title,
.year-panel:not(.is-active) .flow-label,
.year-panel:not(.is-active) .flow-text {
  color: color-mix(in srgb, var(--foreground) 30%, transparent);
}

:global(html.dark) .axis-base {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--foreground) 24%, var(--background) 76%),
    color-mix(in srgb, var(--foreground) 18%, var(--background) 82%)
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

@media (max-width: 1024px) {
  .timeline-track {
    --panel-width: min(21rem, calc(100vw - 6rem));
    gap: 2.25rem;
  }
}

@media (max-width: 768px) {
  .journey-shell {
    width: calc(100% - 2rem);
    padding: 1.5rem;
    border-radius: 1.5rem;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
    line-height: 1.7;
  }

  .timeline-track {
    --panel-width: calc(100vw - 5rem);
    gap: 1.5rem;
    min-height: 23rem;
  }

  .flow-text {
    line-height: 1.72;
  }
}
</style>
