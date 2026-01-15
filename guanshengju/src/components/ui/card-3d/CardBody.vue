<script setup>
const props = defineProps({
  class: { type: String, required: false },
});
</script>

<template>
  <div
    class="h-96 w-96"
    :class="[props.class]"
    style="transform-style: preserve-3d"
  >
    <slot />
  </div>
</template>
