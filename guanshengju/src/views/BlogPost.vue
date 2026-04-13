<script setup>
import { computed, watchEffect } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import BlogEmptyState from '@/components/blog/BlogEmptyState.vue';
import { formatBlogDate, getBlogPostBySlug } from '@/lib/blog';

const route = useRoute();

const post = computed(() => getBlogPostBySlug(String(route.params.slug || '')));

watchEffect(() => {
  document.title = post.value ? `${post.value.title} | GUANSHENGJU` : 'Not Found | GUANSHENGJU';
});
</script>

<template>
  <section class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_62%)]" />
      <div class="absolute left-[12%] top-28 h-44 w-44 rounded-full bg-sky-300/[0.18] blur-[120px] dark:bg-sky-400/10" />
      <div class="absolute right-[18%] top-36 h-44 w-44 rounded-full bg-neutral-300/25 blur-[120px] dark:bg-white/[0.06]" />
      <div class="absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:72px_72px] dark:opacity-15" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
      <div v-if="post" class="mx-auto max-w-3xl">
        <RouterLink
          to="/blog"
          class="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-black/[0.35] transition-colors duration-300 hover:text-black dark:text-white/[0.35] dark:hover:text-white"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Blog</span>
        </RouterLink>

        <header class="mt-8 border-b border-black/[0.08] pb-10 dark:border-white/10">
          <p class="text-[11px] font-semibold uppercase tracking-[0.42em] text-black/[0.35] dark:text-white/[0.35]">
            NOTES / WRITING
          </p>
          <h1 class="mt-5 font-serif text-4xl tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
            {{ post.title }}
          </h1>
          <div class="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-black/[0.35] dark:text-white/[0.35]">
            <span>{{ formatBlogDate(post.date) }}</span>
            <span class="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
            <span>{{ post.readingMinutes }} min read</span>
          </div>

          <div v-if="post.tags.length > 0" class="mt-6 flex flex-wrap gap-2">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="rounded-full border border-black/[0.08] bg-black/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.26em] text-black/[0.45] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/[0.45]"
            >
              {{ tag }}
            </span>
          </div>
        </header>

        <div
          v-if="post.cover"
          class="mt-10 overflow-hidden rounded-[2rem] border border-black/[0.08] bg-white/60 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
        >
          <img :src="post.cover" :alt="`${post.title} cover`" class="aspect-[16/9] w-full object-cover" />
        </div>

        <div class="blog-prose mt-12" v-html="post.html"></div>
      </div>

      <div v-else class="mx-auto mt-10 max-w-3xl">
        <BlogEmptyState
          eyebrow="NOT FOUND"
          title="This post does not exist."
          description="The article may have been renamed, removed, or is still marked as draft."
          primary-label="Back to Blog"
          primary-to="/blog"
        />
      </div>
    </div>
  </section>
</template>
