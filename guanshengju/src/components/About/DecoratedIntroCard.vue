<template>
  <!-- 主容器 -->
  <section class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
    
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
    
  </section>
</template>

<script setup>
import { LineChart } from 'lucide-vue-next';
import About3DCard from './About3DCard.vue';
import FriendsSay from './FriendsSay.vue'; // 即使没用到也可以保留
import LifeFlowChart from './LifeFlowChart.vue';
import OrbitBackground from './OrbitBackground.vue';
import LinkDock from './LinkDock.vue'; // 导入你开发的组件
</script>