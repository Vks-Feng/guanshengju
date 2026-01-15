<template>
  <section id="about">
    <h2>关于 观升 (Guansheng)</h2>
    <About3DCard />
  </section>
</template>

<script setup>
import About3DCard from './About3DCard.vue';
</script>

<style scoped>
section {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}
</style>
