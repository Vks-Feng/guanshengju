<template>
  <section id="share">
    <h2>My Sharings</h2>
    <Blogs />
    <Books />
    <Videos />
  </section>
</template>

<script setup>
import Blogs from './Blogs.vue';
import Books from './Books.vue';
import Videos from './Videos.vue';
</script>

<style scoped>
section {
  min-height: 100vh;
  padding: 2rem;
  background-color: #d0d0d0;
}
h2 {
  text-align: center;
  margin-bottom: 2rem;
}
</style>