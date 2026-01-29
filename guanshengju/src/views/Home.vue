<script setup>
import Navbar from '../components/Nav/Navbar.vue';
import About from '../components/About/About.vue';
import Interests from '../components/Interests/Interests.vue';
import Share from '../components/Share/Share.vue';
import ToBeContinued from '../components/sections/ToBeContinued.vue';

</script>

<template>
  <div class="bg-white dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-300">
    <Navbar />
    <main>
      <About />
      <Interests />
      <Share />
      <ToBeContinued />
    </main>
  </div>
</template>

<style scoped>
main {
  width: 100%;
}
</style>
