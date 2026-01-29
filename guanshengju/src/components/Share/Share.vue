<template>
  <section id="share" class="min-h-screen pt-20 bg-white dark:bg-black">
    <h2 class="text-4xl font-extrabold text-gray-900 dark:text-white text-center py-12">My Sharings</h2>
    <div class="max-w-7xl mx-auto px-4">
      <!-- <Blogs />
      <Books /> -->
      <Videos />
    </div>
  </section>
</template>

<script setup>
import Blogs from './Blogs.vue';
import Books from './Books.vue';
import Videos from './Videos.vue';
</script>

<style scoped>
section {
  width: 100%;
}
</style>