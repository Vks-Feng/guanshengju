<script lang="ts" setup>
import AnimatedTestimonialsText from '../ui/animated-testimonials/AnimatedTestimonialsText.vue';

const testimonials = [
  {
    quote: "思虚勿忘实，虑明勿失今",
    name: "沃兹基硕德",
    designation: "@ Myself"
  },
  {
    quote: "Would you rather live in peace as Mr. Nobody, or go down for all times？",
    name: "一只Only of Memories的耄",
    designation: "friend from high school @ Tsinghua University"
  },
  {
    quote: "我们不要因为新鲜感放弃一个一直愿意陪着你的人 新新鲜感是和旧人做新事，而不是和新人做旧事",
    name: "经常喜欢姐姐的狗",
    designation: "friend from high school @ Dalian University of Technology"
  },
  {
    quote: "云无心以出岫 鸟倦飞而知还",
    name: "Wood",
    designation: "friend from university @ Wuhan University"
  },
  {
    quote: "穿拖鞋爬山的目标不是为了登顶（狗头",
    name: "北郊HH",
    designation: "friend from university @ Wuhan University"
  },
  {
    quote: "EVER IN PERSUIT",
    name: "把你一郭端了",
    designation: "friend from university @ Wuhan University"
  },
  {
    quote: "冯佬，别卷了😭",
    name: "luckz",
    designation: "friend from high school @ Tsinghua University"
  },
  {
    quote: "我想想什么话",
    name: "蓝蓝蓝蓝蓝鹿",
    designation: "friend from university @ Wuhan University"
  },
  {
    quote: "早日p12然后送我一套大别墅",
    name: "Ware Wu",
    designation: "friend from high school @ Huazhong University of Science and Technology"
  },
  {
    quote: "收一下，要不看起来像吹牛",
    name: "pt老师",
    designation: "quote from Alibaba mentor @ Alibaba"
  },
  {
    quote: "叫你带带我，你耳朵聋嘛",
    name: "pt座下大童子",
    designation: "friend from Alibaba @ University of Science and Technology of China"
  },
    {
    quote: "部署的8分钟是你玩手机最爽的1小时",
    name: "pt座下叁童子",
    designation: "friend from Alibaba @ University of Science and Technology of China"
  },
  {
    quote: "很好吃，下次还来",
    name: "pt座下伍童子",
    designation: "friend from University @ Wuhan University"
  }
];
</script>

<template>
  <div class="w-[86%] mx-auto py-8 flex flex-col">
    <div class="flex flex-col space-y-2 mb-4">
      <h2 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
        Friends Say
      </h2>
      <p class="text-neutral-500 dark:text-neutral-400 max-w-2xl text-left">
        Echoes of friendship: a mix of wisdom, wit, and whimsical nonsense.
      </p>
    </div>
    <div class="mt-2 pt-2">
      <AnimatedTestimonialsText
        :testimonials="testimonials"
        :autoplay="true"
        :duration="5000" 
      />
    </div>
  </div>
</template>

<style scoped>
.bg-primary {
  background-color: var(--primary, #3b82f6);
}
</style>
