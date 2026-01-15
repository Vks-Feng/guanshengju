<template>
  <section id="interests">
    <h2>My Interests</h2>
    <Photography />
    <Calligraphy />
    <Games />
    <Music />
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
  padding: 2rem;
  background-color: #e0e0e0;
}
h2 {
  text-align: center;
  margin-bottom: 2rem;
}
</style>