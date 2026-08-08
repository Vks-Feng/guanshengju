<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowLeft, ExternalLink } from 'lucide-vue-next';
import BlogEmptyState from '@/components/blog/BlogEmptyState.vue';
import { formatBlogDate, getBlogPostBySlug } from '@/lib/blog';

const route = useRoute();
const articleRef = ref(null);
const activeHeadingId = ref('');
let headingObserver = null;

const post = computed(() => getBlogPostBySlug(String(route.params.slug || '')));
const tocItems = computed(() => post.value?.toc || []);

watchEffect(() => {
  document.title = post.value ? `${post.value.title} | GUANSHENGJU` : 'Not Found | GUANSHENGJU';
});

function disconnectHeadingObserver() {
  if (headingObserver) {
    headingObserver.disconnect();
    headingObserver = null;
  }
}

function observeHeadings() {
  disconnectHeadingObserver();

  if (!articleRef.value || tocItems.value.length === 0) {
    activeHeadingId.value = '';
    return;
  }

  const headings = tocItems.value
    .map((item) => articleRef.value.querySelector(`#${CSS.escape(item.id)}`))
    .filter(Boolean);

  activeHeadingId.value = headings[0]?.id || '';

  headingObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];

      if (visibleEntry?.target?.id) {
        activeHeadingId.value = visibleEntry.target.id;
      }
    },
    {
      rootMargin: '-18% 0px -68% 0px',
      threshold: 0
    }
  );

  headings.forEach((heading) => headingObserver.observe(heading));
}

async function renderMermaid() {
  await nextTick();

  const nodes = articleRef.value?.querySelectorAll('.mermaid');

  if (!nodes?.length) {
    return;
  }

  const { default: mermaid } = await import('mermaid');

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
  });

  try {
    await mermaid.run({ nodes });
  } catch (error) {
    console.warn('[blog] Failed to render Mermaid diagram.', error);
  }
}

async function refreshArticleEnhancements() {
  await renderMermaid();
  observeHeadings();
}

watch(
  () => post.value?.slug,
  () => {
    refreshArticleEnhancements();
  },
  { flush: 'post' }
);

onMounted(() => {
  refreshArticleEnhancements();
});

onUnmounted(() => {
  disconnectHeadingObserver();
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

    <RouterLink
      to="/blog"
      class="fixed bottom-5 left-4 z-50 inline-flex h-11 items-center gap-2 rounded-full border border-black/[0.08] bg-white/80 px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/55 shadow-[0_16px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:text-black dark:border-white/10 dark:bg-black/70 dark:text-white/55 dark:shadow-[0_16px_50px_rgba(0,0,0,0.3)] dark:hover:text-white sm:left-6"
    >
      <ArrowLeft class="h-4 w-4" />
      <span>Blog</span>
    </RouterLink>

    <div class="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pt-36">
      <div v-if="post" class="grid gap-10 xl:grid-cols-[11rem_minmax(0,48rem)_15rem] xl:items-start">
        <div class="hidden xl:block" />

        <article class="min-w-0">
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
            <template v-if="post.source">
              <span class="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
              <a
                :href="post.source"
                target="_blank"
                rel="noreferrer noopener"
                class="inline-flex items-center gap-1 transition-colors duration-300 hover:text-black dark:hover:text-white"
              >
                <span>Original Source</span>
                <ExternalLink class="h-3 w-3" />
              </a>
            </template>
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

        <div ref="articleRef" class="blog-prose mt-12" v-html="post.html"></div>
        </article>

        <aside v-if="tocItems.length > 0" class="hidden xl:block">
          <nav class="sticky top-28 border-l border-black/[0.08] pl-5 dark:border-white/10">
            <p class="text-[10px] font-semibold uppercase tracking-[0.34em] text-black/[0.32] dark:text-white/[0.32]">
              Contents
            </p>
            <div class="mt-5 max-h-[calc(100vh-9rem)] space-y-2 overflow-y-auto pr-2">
              <a
                v-for="item in tocItems"
                :key="item.id"
                :href="`#${item.id}`"
                class="block border-l pl-3 text-xs leading-5 transition-colors duration-200"
                :class="[
                  item.level === 3 ? 'ml-3' : item.level === 1 ? '-ml-1' : '',
                  activeHeadingId === item.id
                    ? 'border-black text-black dark:border-white dark:text-white'
                    : 'border-transparent text-black/40 hover:border-black/20 hover:text-black/70 dark:text-white/38 dark:hover:border-white/20 dark:hover:text-white/70'
                ]"
              >
                {{ item.title }}
              </a>
            </div>
          </nav>
        </aside>
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
