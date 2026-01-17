<template>
  <!-- 主容器：必须是 relative 且有明确的高度或 min-h-screen -->
  <section class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
    
    <!-- 1. 背景层 (Orbit) -->
    <OrbitBackground />

    <!-- 2. 内容层 (3D Card) -->
    <!-- z-10 确保卡片在轨道上方 -->
    <div class="relative z-10 pointer-events-auto">
      <About3DCard />
    </div>

  </section>

</template>

<script setup>
import About3DCard from './About3DCard.vue';
import FriendsSay from './FriendsSay.vue';
import LifeFlowChart from './LifeFlowChart.vue';
import OrbitBackground from './OrbitBackground.vue';
</script>