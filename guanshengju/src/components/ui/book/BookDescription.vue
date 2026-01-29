<script setup>
defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <p class="text-xs/relaxed select-none" :class="[$props.class]">
    <slot />
  </p>
</template>
