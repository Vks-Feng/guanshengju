<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatBlogDate, getAllBlogPosts } from '@/lib/blog';

const posts = computed(() => getAllBlogPosts().slice(0, 2));
</script>

<template>
  <section class="relative overflow-hidden rounded-[2rem] border border-neutral-200/70 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute left-10 top-8 h-28 w-28 rounded-full bg-sky-300/20 blur-[90px] dark:bg-sky-400/10" />
      <div class="absolute right-10 bottom-0 h-32 w-32 rounded-full bg-rose-200/20 blur-[100px] dark:bg-white/[0.06]" />
    </div>

    <div class="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      <div class="max-w-xl">
        <p class="text-[11px] font-semibold uppercase tracking-[0.42em] text-black/[0.35] dark:text-white/[0.35]">
          WRITING
        </p>
        <h3 class="mt-4 font-serif text-3xl tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
          笔记、技术博客、个人思考与随笔。
        </h3>
        <p class="mt-4 text-sm leading-7 text-black/60 dark:text-white/60 sm:text-base">
          借计算机的逻辑渲染现实，开源我所“观”切面。
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink
            :to="{ name: 'BlogIndex' }"
            class="inline-flex items-center justify-center rounded-full border border-black/10 bg-black px-5 py-2.5 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black/90 dark:border-white/15 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Enter Blog
          </RouterLink>
        </div>
      </div>

      <div class="w-full max-w-2xl space-y-4">
        <RouterLink
          v-for="post in posts"
          :key="post.slug"
          :to="{ name: 'BlogPost', params: { slug: post.slug } }"
          class="group block rounded-[1.5rem] border border-black/[0.07] bg-white/[0.76] p-5 transition duration-300 hover:-translate-y-1 hover:border-black/[0.12] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
        >
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div class="max-w-xl">
              <div class="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-black/[0.35] dark:text-white/[0.35]">
                <span>{{ formatBlogDate(post.date) }}</span>
                <span class="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
                <span>{{ post.readingMinutes }} min read</span>
              </div>
              <h4 class="mt-4 font-serif text-2xl tracking-tight text-neutral-950 dark:text-white">
                {{ post.title }}
              </h4>
              <p class="mt-3 text-sm leading-7 text-black/60 dark:text-white/60">
                {{ post.summary }}
              </p>
            </div>

            <img
              v-if="post.cover"
              :src="post.cover"
              :alt="`${post.title} cover`"
              class="h-24 w-full rounded-[1.25rem] object-cover sm:w-36"
            />
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
