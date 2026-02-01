<template>
  <section class="relative h-screen w-full overflow-hidden flex items-center justify-center -translate-y-[8vh]">
    
    <!-- 内容容器：包含背景和所有内容，确保它们合为一体 -->
    <div class="relative flex flex-col items-center justify-center w-full">
      
      <!-- 1. 背景层 (Orbit) - 绝对定位在容器中心 -->
      <div class="absolute inset-0 z-0 flex items-center justify-center">
        <OrbitBackground />
      </div>
      
      <!-- 2. 内容层 (3D Card + LinkDock) -->
      <!-- mt-12 让卡片相对于背景中心向下偏移 -->
      <div class="relative z-10 flex flex-col items-center pointer-events-none mt-24">
        
        <!-- 3D Card -->
        <div class="pointer-events-auto">
          <About3DCard />
        </div>

        <!-- 3. LinkDock 组件 -->
        <div class="-mt-6 pointer-events-auto">
          <LinkDock />
        </div>
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