<script setup>
import About from '../components/About/About.vue';
import Interests from '../components/Interests/Interests.vue';
import Share from '../components/Share/Share.vue';
import ToBeContinued from '../components/sections/ToBeContinued.vue';
</script>

<template>
  <main>
    <About />
    <Interests />
    <Share />
    <ToBeContinued />
  </main>
</template>

<style scoped>
main {
  width: 100%;
}
</style>
