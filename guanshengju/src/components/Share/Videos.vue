<script setup>
import BentoGrid from '../ui/bento-grid/BentoGrid.vue';
import BentoGridItem from '../ui/bento-grid/BentoGridItem.vue';
import FlipCard from '../ui/flip-card/FlipCard.vue';

// Importing images
import strangerThingsImg from '../../assets/interests/video/stranger_things.png';
import mingDynastyImg from '../../assets/interests/video/ming_dynasty.jpg';
import demonSlayerImg from '../../assets/interests/video/demon_slayer.jpg';
import avengersImg from '../../assets/interests/video/avengers-_endgame.jpg';
import threeBodyImg from '../../assets/interests/video/three_body.jpg';
import interstellarImg from '../../assets/interests/video/interstellar_poster.jpg';
import breakingBadImg from '../../assets/interests/video/breaking_bad.jpg';
import jackalImg from '../../assets/interests/video/jackal.jpg';

// Image Analysis Results:
// avengers-_endgame.jpg: (3840, 2160) -> 1.77 (Landscape) -> col-span-2
// breaking_bad.jpg: (480, 640) -> 0.75 (Portrait) -> col-span-1
// demon_slayer.jpg: (250, 352) -> 0.71 (Portrait) -> col-span-1
// interstellar_poster.jpg: (1296, 730) -> 1.77 (Landscape) -> col-span-2 (Was col-span-1, fixing)
// jackal.jpg: (2560, 1440) -> 1.77 (Landscape) -> col-span-2
// ming_dynasty.jpg: (500, 820) -> 0.61 (Portrait) -> col-span-1
// stranger_things.png: (728, 400) -> 1.82 (Landscape) -> col-span-2
// three_body.jpg: (230, 345) -> 0.66 (Portrait) -> col-span-1 (Was col-span-2, fixing)

const mediaItems = [
  {
    title: "Stranger Things",
    description: "A love letter to the '80s classics that captivated a generation.",
    introduction: "In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.",
    poster: strangerThingsImg,
    class: "md:col-span-2",
  },
  {
    title: "Ming Dynasty in 1566",
    description: "A historical masterpiece detailing the political turmoil of the Ming Dynasty.",
    introduction: "Set during the reign of the Jiajing Emperor, this series vividly portrays the intense political struggles and corruption within the Ming court, focusing on the honest official Hai Rui.",
    poster: mingDynastyImg,
    class: "md:col-span-1",
  },
  {
    title: "Demon Slayer",
    description: "A young demon slayer fights to cure his sister.",
    introduction: "Tanjiro Kamado joins the Demon Slayer Corps to find a cure for his sister Nezuko, who has been turned into a demon, and to avenge his family slaughtered by demons.",
    poster: demonSlayerImg,
    class: "md:col-span-1",
  },
  {
    title: "Avengers: Endgame",
    description: "The epic conclusion to the Infinity Saga.",
    introduction: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    poster: avengersImg,
    class: "md:col-span-2",
  },
  {
    title: "Interstellar", 
    description: "Mankind was born on Earth. It was never meant to die here.",
    introduction: "In a dystopian future, a team of astronauts travels through a wormhole near Saturn in search of a new home for humanity as Earth becomes uninhabitable.",
    poster: interstellarImg,
    class: "md:col-span-2",
  },
  {
    title: "Three-Body",
    description: "The Chinese adaptation of Liu Cixin's hard sci-fi masterpiece.",
    introduction: "A nanoscientist becomes entangled in an investigation into a wave of suicides among scientists, leading him to a mysterious game and a VR world that reveals an alien civilization's struggle for survival.",
    poster: threeBodyImg,
    class: "md:col-span-1", 
  },
  {
    title: "Breaking Bad",
    description: "I am not in danger, Skyler. I am the danger.",
    introduction: "Walter White, a high school chemistry teacher diagnosed with inoperable lung cancer, turns to manufacturing and selling methamphetamine to secure his family's financial future.",
    poster: breakingBadImg,
    class: "md:col-span-1",
  },
  {
    title: "The Day of the Jackal",
    description: "A professional assassin takes on the ultimate target.",
    introduction: "A ruthless and enigmatic professional assassin, known only as 'The Jackal', is hired by a French paramilitary group to assassinate President Charles de Gaulle.",
    poster: jackalImg,
    class: "md:col-span-2",
  },
];
</script>

<template>
  <section class="w-full py-20 bg-background">
    <div class="max-w-7xl mx-auto px-4">
      <h2 class="text-4xl font-bold mb-12 text-neutral-800 dark:text-neutral-200 text-center">
        Media Share
      </h2>
      
      <BentoGrid>
        <BentoGridItem
          v-for="(item, index) in mediaItems"
          :key="index"
          :class="['p-0 overflow-hidden border-none bg-transparent hover:shadow-none flex items-center justify-center', item.class]"
        >
          <template #header>
            <!-- Adjusted classes: removed h-full from FlipCard and added items-center to parent in BentoGridItem -->
            <FlipCard class="w-full h-[18rem] md:h-full min-h-[18rem]">
              <div class="relative w-full h-full">
                <img 
                  :src="item.poster" 
                  :alt="item.title"
                  class="w-full h-full object-cover rounded-2xl" 
                />
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-6 rounded-2xl">
                  <h3 class="text-2xl font-bold text-white drop-shadow-lg">{{ item.title }}</h3>
                </div>
              </div>
              <template #back>
                <div class="flex flex-col h-full justify-center text-center px-4">
                  <h3 class="text-xl font-bold mb-4 text-white">{{ item.title }}</h3>
                  <p class="text-sm leading-relaxed text-slate-300">
                    {{ item.introduction }}
                  </p>
                </div>
              </template>
            </FlipCard>
          </template>
        </BentoGridItem>
      </BentoGrid>
    </div>
  </section>
</template>

<style scoped>
:deep(.group-hover\/bento\:translate-x-2) {
  transform: none !important;
}
</style>
