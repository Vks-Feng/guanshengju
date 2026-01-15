<script setup>

import { ref, inject, watch } from "vue";

const {
  as = "div",
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...props
} = defineProps({
  as: { type: String, required: false, default: "div" },
  class: { type: String, required: false },
  translateX: { type: Number, required: false, default: 0 },
  translateY: { type: Number, required: false, default: 0 },
  translateZ: { type: Number, required: false, default: 0 },
  rotateX: { type: Number, required: false, default: 0 },
  rotateY: { type: Number, required: false, default: 0 },
  rotateZ: { type: Number, required: false, default: 0 },
});

const refElement = ref(null);

const mouseState = inject("use3DCardMouseState");

function handleAnimation(isMouseEntered) {
  if (!refElement.value) return;

  if (isMouseEntered) {
    refElement.value.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
  } else {
    refElement.value.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
  }
}

watch(mouseState.isMouseEntered, handleAnimation, { immediate: true });
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
