<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import BlogEmptyState from '@/components/blog/BlogEmptyState.vue';
import { formatBlogDate, getAllBlogPosts } from '@/lib/blog';

const posts = computed(() => getAllBlogPosts());
</script>

<template>
  <section class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_62%)]" />
      <div class="absolute left-[10%] top-28 h-48 w-48 rounded-full bg-sky-300/20 blur-[120px] dark:bg-sky-400/[0.12]" />
      <div class="absolute right-[12%] top-40 h-52 w-52 rounded-full bg-neutral-300/30 blur-[130px] dark:bg-white/[0.06]" />
      <div class="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:72px_72px] dark:opacity-20" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
      <header class="max-w-5xl">
        <p class="text-[11px] font-semibold uppercase tracking-[0.42em] text-black/[0.35] dark:text-white/[0.35]">
          NOTES / BLOG
        </p>
        <h1 class="mt-6 max-w-4xl font-serif text-4xl tracking-tight text-neutral-950 dark:text-white sm:text-5xl lg:text-6xl">
          Notes, technical blogs,<br/> and fragmented reflections.
        </h1>
        <p class="mt-6 max-w-6xl text-base leading-8 text-black/60 dark:text-white/60 sm:text-lg">
          Rendering reality through computational logic; open-sourcing the facets of my perception.
        </p>
        <div class="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-black/[0.35] dark:text-white/[0.35]">
          <span>{{ posts.length.toString().padStart(2, '0') }} posts</span>
          <span class="h-px w-10 bg-black/10 dark:bg-white/10" />
          <span>Continuously updated</span>
        </div>
      </header>

      <div v-if="posts.length > 0" class="mt-16 space-y-6">
        <RouterLink
          v-for="post in posts"
          :key="post.slug"
          :to="{ name: 'BlogPost', params: { slug: post.slug } }"
          class="group block rounded-[2rem] border border-black/[0.07] bg-white/[0.72] p-6 shadow-[0_24px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-black/[0.12] hover:shadow-[0_28px_120px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_100px_rgba(0,0,0,0.24)] dark:hover:border-white/15 dark:hover:bg-white/[0.07] sm:p-8"
        >
          <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-3xl">
              <div class="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-black/[0.35] dark:text-white/[0.35]">
                <span>{{ formatBlogDate(post.date) }}</span>
                <span class="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
                <span>{{ post.readingMinutes }} min read</span>
              </div>

              <h2 class="mt-5 font-serif text-3xl tracking-tight text-neutral-950 transition-colors duration-300 group-hover:text-black dark:text-white sm:text-[2.15rem]">
                {{ post.title }}
              </h2>

              <p class="mt-4 max-w-2xl text-sm leading-7 text-black/60 dark:text-white/60 sm:text-base">
                {{ post.summary }}
              </p>

              <div v-if="post.tags.length > 0" class="mt-6 flex flex-wrap gap-2">
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="rounded-full border border-black/[0.08] bg-black/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.26em] text-black/[0.45] dark:border-white/10 dark:bg-white/[0.03] dark:text-white/[0.45]"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div
              v-if="post.cover"
              class="overflow-hidden rounded-[1.5rem] border border-black/[0.08] bg-black/[0.025] dark:border-white/10 dark:bg-white/[0.03] lg:w-[280px]"
            >
              <img
                :src="post.cover"
                :alt="`${post.title} cover`"
                class="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-else class="mt-16">
        <BlogEmptyState
          eyebrow="EMPTY ARCHIVE"
          title="No posts yet."
          description="Drop a Markdown file into src/content/blog with frontmatter, and it will appear here automatically."
          primary-label="Return Home"
          primary-to="/"
          secondary-label="Read the Setup"
          :secondary-to="{ name: 'BlogPost', params: { slug: 'writing-in-markdown' } }"
        />
      </div>
    </div>
  </section>
</template>
