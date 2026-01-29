<template>
  <section id="about" class="min-h-screen flex flex-col items-stretch">
    <DecoratedIntroCard class="w-full" />
    <FriendsSay class="flex justify-center" />
    <LifeFlowChart class="w-full" />
  </section>
</template>

<script setup>
import DecoratedIntroCard from './DecoratedIntroCard.vue';
import FriendsSay from './FriendsSay.vue';
import LifeFlowChart from './LifeFlowChart.vue';
</script>

<style scoped>
section {
  width: 100%;
}
</style>
