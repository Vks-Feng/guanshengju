<script setup>
const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    class="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3"
    :class="[props.class]"
  >
    <slot />
  </div>
</template>
