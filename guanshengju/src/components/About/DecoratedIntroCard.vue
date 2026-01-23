<template>
  <!-- 主容器：严格限制为 100vh，防止内容溢出导致 LinkDock 被截断 -->
  <section class="relative flex h-screen w-full flex-col items-center justify-start overflow-hidden bg-white dark:bg-black">
    
    <!-- 1. 背景层 (Orbit) -->
    <OrbitBackground />
    
    <!-- 顶部占位：为导航栏预留空间，并稍微减小以提升整体重心 -->
    <div class="h-16 shrink-0"></div>

    <!-- 2. 内容层 (3D Card) -->
    <!-- 使用 mt-[8vh] 手动提升卡片位置，改善“重心偏下”的感觉 -->
    <div class="relative z-10 pointer-events-auto mt-[8vh]">
      <About3DCard />
    </div>

    <!-- 3. LinkDock 组件 -->
    <!-- 绝对定位在 100vh 容器的底部 -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <LinkDock />
    </div>    
  </section>
</template>

<script setup>
import About3DCard from './About3DCard.vue';
import FriendsSay from './FriendsSay.vue'; 
import LifeFlowChart from './LifeFlowChart.vue';
import OrbitBackground from './OrbitBackground.vue';
import LinkDock from './LinkDock.vue'; 
</script>