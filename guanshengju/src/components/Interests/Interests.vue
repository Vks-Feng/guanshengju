<template>
  <section id="interests" class="min-h-screen pt-20 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-extrabold text-gray-900 dark:text-white text-center py-12">
        My Interests
      </h2>
      <div class="space-y-24 pb-24">
        <Photography />
        <!-- 其他兴趣模块可以根据需要启用 -->
        <!-- <Calligraphy /> -->
        <!-- <Games /> -->
        <!-- <Music /> -->
      </div>
    </div>
  </section>
</template>

<script setup>
import Photography from './Photography.vue';
import Calligraphy from './Calligraphy.vue';
import Games from './Games.vue';
import Music from './Music.vue';
</script>

<style scoped>
section {
  min-height: 100vh;
}
</style>