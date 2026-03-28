<template>
  <section class="relative h-screen w-full overflow-hidden">
    <div class="absolute inset-0">
      <div
        class="absolute inset-0 [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_42%,rgba(0,0,0,0.68)_56%,rgba(0,0,0,0.26)_70%,rgba(0,0,0,0.06)_84%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_42%,rgba(0,0,0,0.68)_56%,rgba(0,0,0,0.26)_70%,rgba(0,0,0,0.06)_84%,rgba(0,0,0,0)_100%)]"
      >
        <img
          :src="aboutDeskImage"
          alt="观升在电脑前 coding，桌上有睡着的猫、相机和毛笔。"
          class="h-full w-full object-cover object-[20%_center] opacity-88 saturate-110 dark:opacity-76"
        />
        <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,145,178,0.22),transparent_45%,rgba(244,114,182,0.08))]" />
      </div>

      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/12 via-white/18 to-white/52 dark:from-[#020617]/14 dark:via-[#020617]/32 dark:to-black/68" />
      <div class="absolute left-[10%] top-[14%] h-48 w-48 rounded-full bg-cyan-400/18 blur-[110px] dark:bg-cyan-400/22" />
      <div class="absolute left-[24%] bottom-[12%] h-40 w-40 rounded-full bg-blue-400/10 blur-[110px] dark:bg-blue-400/14" />
      <div class="absolute right-[12%] top-[14%] h-48 w-48 rounded-full bg-pink-400/10 blur-[130px] dark:bg-fuchsia-400/12" />
      <div
        class="absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:68px_68px] [mask-image:radial-gradient(circle_at_center,black_18%,transparent_78%)]"
      />
    </div>

    <div class="relative z-10 flex h-full w-full items-center justify-center">
      <div class="relative h-full w-full max-w-[1600px] lg:translate-x-[15.6rem] xl:translate-x-[19.2rem] 2xl:translate-x-[21.6rem]">
        <div class="relative flex h-full w-full flex-col items-center justify-center -translate-y-[10vh] lg:-translate-y-[1vh] xl:translate-y-0">
          <div class="absolute inset-0 z-0 flex items-center justify-center">
            <OrbitBackground />
          </div>

          <div class="relative z-10 mt-24 flex flex-col items-center pointer-events-none">
            <div class="pointer-events-auto">
              <About3DCard />
            </div>

            <div class="-mt-6 pointer-events-auto">
              <LinkDock />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import aboutDeskImage from '@/assets/about/cccc.webp';
import About3DCard from './About3DCard.vue';
import LinkDock from './LinkDock.vue';
import OrbitBackground from './OrbitBackground.vue';
</script>
