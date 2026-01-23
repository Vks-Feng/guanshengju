<script setup>

import { ref, inject, watch } from "vue";

const props = defineProps({
  as: { type: String, required: false, default: "div" },
  class: { type: String, required: false },
  translateX: { type: [Number, String], required: false, default: 0 },
  translateY: { type: [Number, String], required: false, default: 0 },
  translateZ: { type: [Number, String], required: false, default: 0 },
  rotateX: { type: [Number, String], required: false, default: 0 },
  rotateY: { type: [Number, String], required: false, default: 0 },
  rotateZ: { type: [Number, String], required: false, default: 0 },
});

const refElement = ref(null);

const mouseState = inject("use3DCardMouseState");

function handleAnimation() {
  if (!refElement.value) return;

  if (mouseState.isMouseEntered.value) {
    refElement.value.style.transform = `translateX(${props.translateX}px) translateY(${props.translateY}px) translateZ(${props.translateZ}px) rotateX(${props.rotateX}deg) rotateY(${props.rotateY}deg) rotateZ(${props.rotateZ}deg)`;
  } else {
    refElement.value.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
  }
}

// Watch mouse state, transformation props, and the element ref itself
watch(
  [
    () => mouseState.isMouseEntered.value,
    () => props.translateX,
    () => props.translateY,
    () => props.translateZ,
    () => props.rotateX,
    () => props.rotateY,
    () => props.rotateZ,
    refElement,
  ],
  () => {
    handleAnimation();
  },
  { immediate: true },
);
</script>

<template>
  <component
    :is="as"
    ref="refElement"
    class="w-fit transition duration-500 ease-in-out"
    :class="[props.class]"
  >
    <slot />
  </component>
</template>
