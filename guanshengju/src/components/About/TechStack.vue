<script lang="ts" setup>
import AnimateGrid from "../ui/animate-grid/AnimateGrid.vue";

// Languages
import javaImg from "@/assets/tech-stack/language/java.png";
import cppImg from "@/assets/tech-stack/language/C++.png";
import pythonImg from "@/assets/tech-stack/language/Python.png";
import jsImg from "@/assets/tech-stack/language/nodejs.png";

// Frameworks
import springImg from "@/assets/tech-stack/framework/springboot.png";
import vueImg from "@/assets/tech-stack/framework/Vue.png";
import langchainImg from "@/assets/tech-stack/framework/langchain.png";
import mybatisImg from "@/assets/tech-stack/framework/mybatis.png";

// Tools
import gitImg from "@/assets/tech-stack/tool/git.png";
import mavenImg from "@/assets/tech-stack/tool/maven.png";
import dockerImg from "@/assets/tech-stack/tool/docker.png";
import ubuntuImg from "@/assets/tech-stack/tool/Ubuntu.png";

// AI
import chatgptImg from "@/assets/tech-stack/ai/ChatGPT_logo.png";
import geminiImg from "@/assets/tech-stack/ai/Google-Gemini-Symbol.png";
import claudeImg from "@/assets/tech-stack/ai/claude.png";
import qwenImg from "@/assets/tech-stack/ai/Qwen.png";

const cards = [
  // language
  { name: "Java", logo: javaImg },
  { name: "C++", logo: cppImg },
  { name: "Python", logo: pythonImg },
  { name: "JS/TS", logo: jsImg },
  // framework
  { name: "Spring", logo: springImg },
  { name: "Vue", logo: vueImg },
  { name: "Langchain", logo: langchainImg },
  { name: "Mybatis", logo: mybatisImg },
  // tool
  { name: "Git", logo: gitImg },
  { name: "Maven", logo: mavenImg },
  { name: "Docker", logo: dockerImg },
  { name: "Ubuntu", logo: ubuntuImg },
  // ai
  { name: "Gemini", logo: geminiImg },
  { name: "ChatGPT", logo: chatgptImg },
  { name: "Claude", logo: claudeImg },
  { name: "Qwen", logo: qwenImg },
];
</script>

<template>
  <div class="tech-stack-container">
    <div class="header">
      <h2 class="title">Tech Stack</h2>
      <p class="subtitle">Some of the tools and technologies that empower my creative journey.</p>
    </div>
    
    <div class="flex items-center justify-center w-full overflow-visible">
      <AnimateGrid
        :cards="cards"
        text-glow-start-color="#38ef7d80"
        text-glow-end-color="#38ef7d"
        :perspective="600"
        :rotate-x="-1"
        :rotate-y="-15"
        class="gap-6 -ml-12"
      >
        <template #logo="{ logo, index }">
          <div class="tech-item-container flex flex-col items-center justify-center w-full aspect-square transition-all duration-300">
            <img :src="logo" :alt="cards[index].name" class="w-12 h-12 object-contain mb-2 filter grayscale group-hover:grayscale-0 transition-all duration-500" />
            <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-foreground">{{ cards[index].name }}</span>
          </div>
        </template>
      </AnimateGrid>
    </div>
  </div>
</template>

<style scoped>
.tech-stack-container {
  flex: 1;
  min-width: 300px;
  margin: 4rem auto;
  border-radius: 2rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.title { 
  font-size: 2.5rem; 
  margin: 0; 
  color: var(--foreground); 
  font-family: ui-serif, Georgia, serif; 
}

.subtitle { 
  color: var(--muted-foreground); 
  margin: 0.5rem 0 2rem 0; 
  font-size: 1.1rem; 
}

.logo-placeholder {
  background: rgba(var(--muted-foreground-rgb), 0.05);
}

@media (max-width: 1024px) {
  .tech-stack-container {
    width: 78%;
    max-width: 1000px;
  }
}
</style>
