<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Monitor } from 'lucide-vue-next';

const isMobile = ref(false);

const checkMobile = () => {
  // Check both user agent and screen width
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const smallScreen = window.innerWidth < 1024;
  isMobile.value = mobileUA || smallScreen;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div v-if="isMobile" class="mobile-notice-wrapper">
    <div class="mobile-notice">
      <div class="glass-overlay"></div>
      <div class="glow-effect"></div>
      <div class="content">
        <div class="icon-container">
          <Monitor class="monitor-icon" />
          <div class="icon-pulse"></div>
        </div>
        <div class="text-group">
          <h2 class="title">Recommended</h2>
          <p class="description">
            For the best experience, please visit on a desktop.
          </p>
          <p class="network-hint" style="font-size: 0.85em; color: #888; margin-top: 5px;">
            * Some assets may require a VPN to load correctly.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-notice-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem 0 1rem;
  box-sizing: border-box;
}

.mobile-notice {
  position: relative;
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1.25rem;
  overflow: hidden;
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.dark .mobile-notice {
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.glass-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}

.glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.05) 0%,
    transparent 50%
  );
  pointer-events: none;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-container {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  color: #3b82f6;
  flex-shrink: 0;
}

.monitor-icon {
  width: 24px;
  height: 24px;
  position: relative;
  z-index: 2;
}

.icon-pulse {
  position: absolute;
  inset: 0;
  background: #3b82f6;
  border-radius: 12px;
  opacity: 0.2;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.2; }
  100% { transform: scale(1.5); opacity: 0; }
}

.text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.01em;
}

.description {
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
  color: #666;
  font-weight: 500;
}

.dark .description {
  color: #aaa;
}

/* On desktop, we still hide it if screen width is large enough, 
   even if UA detection failed (unlikely for desktops) */
@media (min-width: 1024px) {
  .mobile-notice-wrapper {
    display: none;
  }
}
</style>
