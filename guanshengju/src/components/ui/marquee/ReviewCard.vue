<script setup>
defineProps({
  img: { type: String, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  body: { type: String, required: true },
});
</script>

<template>
  <figure
    class="relative w-[450px] aspect-[3/2] cursor-pointer overflow-hidden rounded-xl border border-gray-950/[.1] bg-gray-950/[.01] p-0 hover:bg-gray-950/[.05] dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
  >
    <img :src="img" class="w-full h-full object-cover" alt="" />
  </figure>
</template>
