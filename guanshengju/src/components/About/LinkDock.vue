<!-- LinkDock.vue -->
<script setup>
import Dock from "@/components/ui/dock/Dock.vue";
import DockIcon from "@/components/ui/dock/DockIcon.vue";
import DockSeparator from "@/components/ui/dock/DockSeparator.vue";
import { Icon } from "@iconify/vue";

const links = [
  { 
    name: "GitHub", 
    icon: "mdi:github", 
    href: "https://github.com/Vks-Feng",
    color: "#ffffff" // GitHub 在深色背景下通常用白色
  },
  { 
    name: "Email", 
    icon: "mdi:email", 
    href: "mailto:vksfeng@outlook.com",
    color: "#115EA3" // Google Blue
  },
  { type: "separator" },
  { 
    name: "小红书", 
    icon: "simple-icons:xiaohongshu", 
    href: "https://www.xiaohongshu.com/user/profile/64db806a00000000010133d8",
    color: "#ff2442" // 小红书标志性红
  },
  { 
    name: "抖音", 
    icon: "simple-icons:tiktok", 
    href: "https://www.douyin.com/user/MS4wLjABAAAAnXADEX18Pae-FdSoLr1aOzZap4eGNpyzN9ss5vM90RO8rRNeclEzvcVQNTfcuiLr",
    color: "#FFFFFF" // 抖音青色（或使用白色）
  },
];
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <!-- 这里的背景做了磨砂处理，即便在黑底下也能通过边框和微弱的反光看清 Dock 容器 -->
    <Dock 
      :magnification="60" 
      :distance="140" 
      class="bg-white/5 dark:bg-zinc-900/50 border-white/10 backdrop-blur-xl shadow-2xl"
    >
      <template v-for="(item, index) in links" :key="index">
        <!-- 分隔符颜色也调淡一点 -->
        <DockSeparator v-if="item.type === 'separator'" class="bg-white/20" />
        
        <DockIcon v-else class="group relative">
          <!-- Tooltip 保持原样 -->
          <div class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-zinc-800 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            {{ item.name }}
          </div>
          
          <a 
            :href="item.href" 
            target="_blank" 
            class="flex items-center justify-center w-full h-full p-2"
          >
            <!-- 关键点：使用 style 直接绑定颜色，移除所有 hover:text 类 -->
            <Icon 
              :icon="item.icon" 
              :style="{ color: item.color }" 
              class="w-full h-full transition-transform duration-300" 
            />
          </a>
        </DockIcon>
      </template>
    </Dock>
  </div>
</template>