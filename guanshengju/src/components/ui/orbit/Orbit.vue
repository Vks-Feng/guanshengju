<!-- src/components/ui/orbit/Orbit.vue -->
<script>
export const ORBIT_DIRECTION = {
  Clockwise: "normal",
  CounterClockwise: "reverse",
};
</script>

<script setup>
import { computed } from "vue";

const props = defineProps({
  class: { type: String, default: "" },
  direction: { type: String, default: ORBIT_DIRECTION.Clockwise },
  duration: { type: Number, default: 20 },
  delay: { type: Number, default: 10 },
  radius: { type: [Number, String], default: 50 }, // 支持数字或字符串(如 20vw)
  path: { type: Boolean, default: true }, // 默认开启轨道线
});

const radiusValue = computed(() => {
  return typeof props.radius === 'number' ? `${props.radius}px` : props.radius;
});

const negativeDelay = computed(() => -props.delay);
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
    <!-- 轨道线 -->
    <svg v-if="path" class="absolute inset-0 size-full overflow-visible">
      <circle
        class="stroke-neutral-300/50 dark:stroke-neutral-700/50 stroke-[1.5px]"
        stroke-dasharray="4 4" 
        cx="50%"
        cy="50%"
        :r="props.radius"
        fill="none"
      />
    </svg>
    
    <!-- 旋转物体 -->
    <div
      class="animate-orbit absolute flex items-center justify-center"
      :style="{
        '--radius': radiusValue,
        '--duration': duration + 's',
        '--delay': negativeDelay + 's',
        '--direction': direction
      }"
      :class="[props.class]"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
@keyframes orbit {
  0% {
    transform: rotate(0deg) translateY(calc(-1 * var(--radius))) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateY(calc(-1 * var(--radius))) rotate(-360deg);
  }
}

.animate-orbit {
  animation: orbit var(--duration) linear infinite;
  animation-delay: var(--delay);
  animation-direction: var(--direction);
}
</style>