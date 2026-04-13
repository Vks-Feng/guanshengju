<script setup>
import { useDark } from '@vueuse/core';
import Navbar from './components/Nav/Navbar.vue';
import MobileNotice from './components/ui/MobileNotice.vue';

// Initialize dark mode
useDark();
</script>

<template>
  <div class="min-h-screen bg-white text-black transition-colors duration-300 dark:bg-black dark:text-white">
    <MobileNotice />
    <Navbar />
    <router-view />
  </div>
</template>
