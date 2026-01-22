<template>
  <!-- 主容器 -->
  <section class="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
    
    <!-- 1. 背景层 (Orbit) - 这里的 z-index 通常较低 -->
    <OrbitBackground />

    <!-- 2. 内容层 (3D Card) -->
    <!-- z-10 确保卡片在轨道上方 -->
    <div class="relative z-10 pointer-events-auto">
      <About3DCard />
    </div>

    <!-- 3. LinkDock 组件 -->
    <!-- 我们用一个容器包裹它，确保它位于屏幕底部并居中 -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <LinkDock />
    </div>

    <!-- 4. 主题切换按钮 -->
    <div class="absolute top-8 right-8 z-50">
      <ThemeToggle />
    </div>
    
  </section>
</template>

<script setup>
import About3DCard from './About3DCard.vue';
import FriendsSay from './FriendsSay.vue'; 
import LifeFlowChart from './LifeFlowChart.vue';
import OrbitBackground from './OrbitBackground.vue';
import LinkDock from './LinkDock.vue'; 
import ThemeToggle from '../ui/ThemeToggle.vue';
</script>