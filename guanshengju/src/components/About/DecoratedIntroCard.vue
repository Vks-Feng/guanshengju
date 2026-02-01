<template>
  <!-- 主容器：严格限制为 100vh，防止内容溢出导致 LinkDock 被截断 -->
  <section class="relative flex h-screen w-full flex-col items-center justify-start overflow-hidden">
    
    <!-- 1. 背景层 (Orbit) -->
    <OrbitBackground />
    
    <!-- 顶部占位：适度调小高度，将内容整体上移 -->
    <div class="h-20 shrink-0"></div>

    <!-- 2. 内容层 (3D Card) -->
    <!-- 调整 mt 确保不被悬浮导航栏遮挡，并保持视觉平衡 -->
    <div class="relative z-10 flex flex-col items-center pointer-events-none mt-[8vh]">
      <div class="pointer-events-auto">
        <About3DCard />
      </div>

      <!-- 3. LinkDock 组件 -->
      <!-- 使用负边距 (Negative Margin) 来抵消卡片组件自带的内边距 (p-10) -->
      <!-- 这样可以实现视觉上的“贴合”效果，解决 mt-1 依然感觉远的问题 -->
      <div class="-mt-6 pointer-events-auto pb-10">
        <LinkDock />
      </div>
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