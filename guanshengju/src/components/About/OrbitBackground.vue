<!-- src/components/sections/OrbitBackground.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Orbit, ORBIT_DIRECTION } from "@/components/ui/orbit";

// --- 导入静态资源 ---
import chatgptIcon from '@/assets/orbit-icons/chatgpt.svg';
import alibabaIcon from '@/assets/orbit-icons/alibaba.svg';
import cppIcon from '@/assets/orbit-icons/cpp.svg';
import javaIcon from '@/assets/orbit-icons/java.svg';
import billiardsIcon from '@/assets/orbit-icons/billiards.svg';
import cameraIcon from '@/assets/orbit-icons/camera.svg';
import brushIcon from '@/assets/orbit-icons/brush.svg';
import avatarImg from '@/assets/orbit-icons/avatar.jpg';

const orbitConfig = ref({
  inner: 20,
  middle: 50,
  outer: 80
});

const cardHalfWidth = ref(240);

const updateSize = () => {
  const width = window.innerWidth;
  if (width < 640) {
    cardHalfWidth.value = width * 0.4; 
  } else {
    cardHalfWidth.value = 240;
  }
};

onMounted(() => {
  updateSize();
  window.addEventListener('resize', updateSize);
});
onUnmounted(() => window.removeEventListener('resize', updateSize));

// 使用导入的变量
const icons = {
  chatgpt: chatgptIcon,
  alibaba: alibabaIcon,
  cpp: cppIcon,
  java: javaIcon,
  billiards: billiardsIcon,
  camera: cameraIcon,
  brush: brushIcon,
  avatar: avatarImg
};
</script>

<template>
  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
    
    <!-- 第一层：科技公司 -->
    <Orbit :radius="cardHalfWidth + orbitConfig.inner" :duration="10">
      <img :src="icons.chatgpt" class="size-20 opacity-80 object-contain" />
    </Orbit>
    <Orbit :radius="cardHalfWidth + orbitConfig.inner" :duration="12" :delay="12.5">
      <img :src="icons.alibaba" class="size-20 opacity-80 object-contain" />
    </Orbit>

    <!-- 第二层：技能 -->
    <Orbit :radius="cardHalfWidth + orbitConfig.middle" :duration="16" :direction="ORBIT_DIRECTION.CounterClockwise">
      <img :src="icons.cpp" class="size-20 opacity-80 object-contain" />
    </Orbit>
    <Orbit :radius="cardHalfWidth + orbitConfig.middle" :duration="9" :delay="13" :direction="ORBIT_DIRECTION.CounterClockwise">
      <img :src="icons.java" class="size-20 opacity-80 object-contain" />
    </Orbit>
    <Orbit :radius="cardHalfWidth + orbitConfig.middle" :duration="13" :delay="26" :direction="ORBIT_DIRECTION.CounterClockwise">
      <img :src="icons.billiards" class="size-20 opacity-80 object-contain" />
    </Orbit>

    <!-- 第三层：生活 -->
    <Orbit :radius="cardHalfWidth + orbitConfig.outer" :duration="18" :delay="10">
      <img :src="icons.camera" class="size-20 opacity-70 object-contain" />
    </Orbit>
    <Orbit :radius="cardHalfWidth + orbitConfig.outer" :duration="21" :delay="20">
      <img :src="icons.brush" class="size-20 opacity-70 object-contain" />
    </Orbit>
    
    <!-- 你的大头像 -->
    <Orbit :radius="cardHalfWidth + orbitConfig.outer" :duration="25" :delay="40">
      <div class="p-1.5 bg-background rounded-full shadow-xl border border-border overflow-hidden">
         <img :src="icons.avatar" class="size-40 rounded-full object-cover" />
      </div>
    </Orbit>

  </div>
</template>