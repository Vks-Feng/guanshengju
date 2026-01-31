<script setup lang="ts">
defineProps<{
  img: string;
  name: string;
  username: string;
  body: string;
  workImg: string;
}>();
</script>

<template>
  <figure
    class="relative w-80 cursor-pointer overflow-hidden rounded-xl border p-4
    border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]
    dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]
    transition-colors duration-300 flex flex-col gap-4"
  >
    <div class="flex flex-row items-center gap-2">
      <img class="rounded-full w-10 h-10 object-cover border border-gray-200 dark:border-gray-700" :src="img" :alt="name" />
      <div class="flex flex-col">
        <span class="text-sm font-bold text-gray-900 dark:text-white">
          {{ name }}
        </span>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ username }}</p>
      </div>
    </div>
    
    <blockquote class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed h-[96px] overflow-hidden">
      {{ body }}
    </blockquote>

    <!-- Work Image 4:3 -->
    <div class="w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img :src="workImg" :alt="`${name}'s work`" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
    </div>
  </figure>
</template>
