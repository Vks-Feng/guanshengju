<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core';
import { Sun, Moon } from 'lucide-vue-next';

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <button
    @click="toggleDark()"
    class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 dark:border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-md text-foreground shadow-sm transition-all hover:scale-110 active:scale-95"
    aria-label="Toggle theme"
  >
    <Sun
      v-if="isDark"
      class="h-5 w-5 transition-all text-yellow-400"
    />
    <Moon
      v-else
      class="h-5 w-5 transition-all text-slate-700"
    />
  </button>
</template>
