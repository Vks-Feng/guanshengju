<template>
  <section id="about" class="min-h-screen flex flex-col items-stretch">
    <DecoratedIntroCard class="w-full" />
    <FriendsSay class="flex justify-center" />
    <div class="flex flex-col lg:flex-row gap-8 px-4 lg:px-12 w-full max-w-[1600px] mx-auto">
      <LifeFlowChart />
      <TechStack />
    </div>
  </section>
</template>

<script setup>
import DecoratedIntroCard from './DecoratedIntroCard.vue';
import FriendsSay from './FriendsSay.vue';
import LifeFlowChart from './LifeFlowChart.vue';
import TechStack from './TechStack.vue';
</script>

<style scoped>
section {
  width: 100%;
}
</style>
