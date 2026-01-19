<script setup>
// 1. 必须从 vue 导入 inject
import { inject } from "vue"; 
// 2. 确保使用花括号 {} 进行命名导入
import { ORIENTATION_INJECTION_KEY } from "./injectionKeys";

const orientation = inject(ORIENTATION_INJECTION_KEY, "horizontal");
</script>

<template>
  <div
    class="bg-gray-300 dark:bg-gray-700 relative block"
    :class="[orientation === 'vertical' ? 'h-0.5 w-4/5' : 'h-4/5 w-0.5']"
  />
</template>