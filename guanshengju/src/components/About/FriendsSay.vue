<script lang="ts" setup>
import DesignTestimonials from '../ui/design-testimonials/DesignTestimonials.vue';

const testimonials = [
  {
    quote: "Would you rather live in peace as Mr. Nobody, or go down for all times？",
    author: "一只Only of Memories的耄",
    role: "friend from high school",
    company: "Tsinghua University"
  },
  {
    quote: "我们不要因为新鲜感放弃一个一直愿意陪着你的人 新鲜感是和旧人做新事，而不是和新人做旧事",
    author: "经常喜欢姐姐的狗",
    role: " friend from high school",
    company: "Dalian University of Technology"
  },
  {
    quote: "云无心以出岫 鸟倦飞而知还",
    author: "Wood",
    role: " friend from university",
    company: "Wuhan University"
  },
  {
    quote: "EVER IN PERSUIT",
    author: "把你一郭端了",
    role: "friend from university",
    company: "Wuhan University"
  },
  {
    quote: "冯佬，别卷了😭",
    author: "luckz",
    role: "friend from high school",
    company: "Tsinghua University"
  },
  {
    quote: "我想想什么话",
    author: "蓝蓝蓝蓝蓝鹿",
    role: "friend from university",
    company: "Wuhan University"
  },
  {
    quote: "早日p12然后送我一套大别墅",
    author: "Ware Wu",
    role: "friend from high school",
    company: "Huazhong University of Science and Technology"
  },
  {
    quote: "收一下，要不看起来像吹牛",
    author: "pt老师",
    role: "quote from Alibaba mentor",
    company: "Alibaba"
  },
  {
    quote: "叫你带带我，你耳朵聋嘛",
    author: "pt座下大童子",
    role: "friend from Alibaba",
    company: "University of Science and Technology of China"
  },
  {
    quote: "很好吃，下次还来",
    author: "pt座下伍童子",
    role: "friend from Alibaba",
    company: "Wuhan University"
  }
];
</script>

<template>
  <div class="min-h-screen bg-background">
    <DesignTestimonials
      :testimonials="testimonials"
      title="Friends Say"
      :duration="3000" 
    />
  </div>
</template>