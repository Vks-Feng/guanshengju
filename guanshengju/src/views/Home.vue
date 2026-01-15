<script setup>
import About from '../components/About/About.vue';
import Interests from '../components/Interests/Interests.vue';
import Share from '../components/Share/Share.vue';
</script>

<template>
  <main>
    <About />
    <Interests />
    <Share />
  </main>
</template>

<style scoped>
main {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}
main > section {
    scroll-snap-align: start;
    scroll-snap-stop: always;
}
</style>
