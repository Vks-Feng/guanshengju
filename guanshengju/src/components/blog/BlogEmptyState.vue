<script setup>
const props = defineProps({
  eyebrow: {
    type: String,
    default: 'BLOG'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  primaryLabel: {
    type: String,
    default: 'Back to Blog'
  },
  primaryTo: {
    type: [String, Object],
    default: '/blog'
  },
  secondaryLabel: {
    type: String,
    default: 'Return Home'
  },
  secondaryTo: {
    type: [String, Object],
    default: '/'
  }
});
</script>

<template>
  <div class="rounded-[2rem] border border-black/[0.08] bg-white/[0.72] p-8 text-center shadow-[0_24px_100px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_24px_100px_rgba(0,0,0,0.28)] sm:p-12">
    <p class="text-[11px] font-semibold uppercase tracking-[0.42em] text-black/[0.35] dark:text-white/[0.35]">
      {{ props.eyebrow }}
    </p>
    <h2 class="mt-5 font-serif text-3xl tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
      {{ props.title }}
    </h2>
    <p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/60 dark:text-white/60 sm:text-base">
      {{ props.description }}
    </p>

    <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <RouterLink
        :to="props.primaryTo"
        class="inline-flex items-center justify-center rounded-full border border-black/10 bg-black px-5 py-2.5 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black/90 dark:border-white/15 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        {{ props.primaryLabel }}
      </RouterLink>
      <RouterLink
        :to="props.secondaryTo"
        class="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 py-2.5 text-sm font-medium text-black/70 transition duration-300 hover:-translate-y-0.5 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white"
      >
        {{ props.secondaryLabel }}
      </RouterLink>
    </div>
  </div>
</template>
