<script setup>
import { Coins, Compass, Swords } from 'lucide-vue-next';

import goldenSpatulaImg from '@/assets/share/games/golden-spatula-alt1.jpg';
import leagueOfLegendsImg from '@/assets/share/games/league-of-legends.jpg';
import yimengJianghuImg from '@/assets/share/games/yimeng-jianghu-alt.jpg';

const games = [
  {
    title: 'League of Legends',
    subtitle: 'The one game I can always come back to',
    description:
      'MOBA is the only genre that has stayed with me for years. Even when I do not want to think too much, mechanics and muscle memory are already enough to make it fun, and I still love that I shared it with friends from every stage of school.',
    note: 'Hextech ARAM forever.',
    tags: ['MOBA', 'Mechanics', 'Old friends'],
    image: leagueOfLegendsImg,
    icon: Swords,
    objectPosition: '50% 50%',
    accentClass:
      'from-sky-500/25 via-cyan-400/10 to-transparent dark:from-sky-400/25 dark:via-cyan-300/10',
    iconClass:
      'text-sky-600 bg-sky-500/10 border-sky-500/20 dark:text-sky-300 dark:bg-sky-400/10 dark:border-sky-400/20',
  },
  {
    title: 'Yimeng Jianghu',
    subtitle: 'A beautiful world I still miss',
    description:
      'I entered out of curiosity and stayed for its freedom, wuxia atmosphere, and traditional Chinese aesthetics. Even now, the soundtrack can still pull me back to those rides across the jianghu with my shifu and companions.',
    note: 'You can revisit a game, not a season of youth.',
    tags: ['Wuxia', 'Companions', 'BGM'],
    image: yimengJianghuImg,
    icon: Compass,
    objectPosition: '50% 42%',
    accentClass:
      'from-amber-400/25 via-rose-400/10 to-transparent dark:from-amber-300/25 dark:via-rose-300/10',
    iconClass:
      'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-300 dark:bg-amber-400/10 dark:border-amber-400/20',
  },
  {
    title: 'Teamfight Tactics',
    subtitle: 'The unexpected long-term pick',
    description:
      'Auto battlers never clicked for me until a Bilibili video explained this game through finance logic. It is still far more about understanding than mechanics, which makes it hard for me, but it somehow keeps inviting me back for another round.',
    note: 'Not easy for me, still strangely magnetic.',
    tags: ['Auto Battler', 'Strategy', 'One more round'],
    image: goldenSpatulaImg,
    icon: Coins,
    objectPosition: '46% 36%',
    accentClass:
      'from-orange-400/25 via-yellow-300/10 to-transparent dark:from-orange-300/25 dark:via-yellow-200/10',
    iconClass:
      'text-orange-600 bg-orange-500/10 border-orange-500/20 dark:text-orange-300 dark:bg-orange-400/10 dark:border-orange-400/20',
  },
];
</script>

<template>
  <section class="space-y-6">
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500">
        Play Log
      </p>
      <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        Games I've Played
      </h2>
      <p class="max-w-3xl text-sm leading-7 text-neutral-500 dark:text-neutral-400 sm:text-base">
        A few games that stayed with me for completely different reasons.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <article
        v-for="game in games"
        :key="game.title"
        class="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/5 bg-white/80 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_100px_-48px_rgba(15,23,42,0.36)] dark:border-white/10 dark:bg-white/[0.04]"
      >
        <div class="relative aspect-[16/10] overflow-hidden">
          <img
            :src="game.image"
            :alt="game.title"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            :style="{ objectPosition: game.objectPosition }"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div class="absolute inset-x-0 top-0 h-28 bg-gradient-to-b" :class="game.accentClass" />

          <div class="absolute left-5 right-5 top-5 flex items-start justify-between gap-4">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-md"
              :class="game.iconClass"
            >
              <component :is="game.icon" class="size-5" />
            </div>
            <span class="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-white/80 uppercase backdrop-blur-md">
              Played
            </span>
          </div>

          <div class="absolute inset-x-0 bottom-0 p-5 text-white">
            <h3 class="text-2xl font-semibold tracking-tight">
              {{ game.title }}
            </h3>
            <p class="mt-1 text-sm text-white/75">
              {{ game.subtitle }}
            </p>
          </div>
        </div>

        <div class="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
          <p class="min-h-[10.5rem] text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            {{ game.description }}
          </p>

          <div class="mt-auto space-y-4 pt-2">
            <p class="text-sm font-medium italic text-neutral-900 dark:text-neutral-100">
              {{ game.note }}
            </p>

            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in game.tags"
                :key="tag"
                class="rounded-full border border-black/5 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-white/10 dark:text-neutral-400"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
