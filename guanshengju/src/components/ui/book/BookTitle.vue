<script setup>
defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <h1
    class="mt-3 mb-1 font-bold text-balance select-none"
    :class="[$props.class]"
  >
    <slot />
  </h1>
</template>
