<script setup>
defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div class="flex flex-wrap gap-2" :class="[$props.class]">
    <slot />
  </div>
</template>
