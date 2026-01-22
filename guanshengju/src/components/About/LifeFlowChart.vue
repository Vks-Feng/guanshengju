<template>
  <div class="card-container mx-auto">
    <div class="header">
      <h2 class="title">LifeFlow</h2>
      <p class="subtitle">早年的时间几乎只指向一个方向。<br>随着世界被打开，兴趣开始生长，时间也不再只有一种去处......</p>
    </div>

    <svg :viewBox="`0 0 ${width} ${height}`" class="chart-svg">
      <!-- 背景网格 -->
      <g class="axis-grid">
        <line v-for="tick in [20, 40, 60, 80]" :key="tick" 
          :x1="padding.left" :y1="yScale(tick)" :x2="width - padding.right" :y2="yScale(tick)" 
          class="stroke-border opacity-30" />
        <text v-for="tick in [20, 40, 60, 80]" :key="'t'+tick" 
          :x="padding.left - 12" :y="yScale(tick)" class="axis-text" text-anchor="end">
          {{ tick }}%
        </text>
      </g>

      <!-- 面积色块 -->
      <g class="areas">
        <path
          v-for="(path, index) in areaPaths"
          :key="index"
          :d="path.d"
          :fill="path.color"
          class="area-path"
        />
      </g>

      <!-- 标签层 (优化后的定位) -->
      <g class="labels" pointer-events="none">
        <text
          v-for="(label, index) in dynamicLabels"
          :key="index"
          :x="label.x"
          :y="label.y"
          class="area-label"
          :style="{ fontSize: label.fontSize + 'px' }"
        >
          {{ label.name }}
        </text>
      </g>

      <!-- X轴 -->
      <g class="x-axis">
        <line :x1="padding.left" :y1="height - padding.bottom" :x2="width - padding.right" :y2="height - padding.bottom" class="stroke-border" />
        <g v-for="age in [0, 5, 12, 18, 21]" :key="age" :transform="`translate(${xScale(age)}, ${height - padding.bottom})`">
          <line y2="6" class="stroke-border" />
          <text y="22" class="axis-text" text-anchor="middle">{{ age }}</text>
        </g>
        <text :x="(width - padding.left - padding.right)/2 + padding.left" :y="height - 5" class="axis-text" font-weight="600">Age</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import * as d3 from 'd3';

const width = 800;
const height = 450;
const padding = { top: 20, right: 50, bottom: 50, left: 60 };

// --- 你更新后的数据 ---
const rawData = [
  { age: 0,  study: 30, game: 50, social: 20, coding: 0,  calligraphy: 0, photo: 0 },
  { age: 6,  study: 30, game: 50, social: 20, coding: 0,  calligraphy: 0, photo: 0 },
  { age: 12, study: 35, game: 45, social: 20, coding: 0,  calligraphy: 0, photo: 0 },
  { age: 15, study: 85, game: 10, social: 5,  coding: 0,  calligraphy: 0, photo: 0 },
  { age: 18, study: 85, game: 5,  social: 10, coding: 0,  calligraphy: 0, photo: 0 },
  { age: 19, study: 35, game: 10, social: 15, coding: 20, calligraphy: 10, photo: 10 },
  { age: 21, study: 20, game: 5,  social: 15, coding: 30, calligraphy: 15, photo: 15 },
];

// 调整 keys 顺序：Study 放底层，社交/游戏放中间，开枝散叶的兴趣放顶层
const keys = ['study', 'game', 'social', 'coding', 'calligraphy', 'photo'];
const keyMap = { study: '学习', game: '游戏', social: '社交', coding: 'Coding', calligraphy: '书法', photo: '摄影' };

// 使用 CSS 变量或根据主题调整颜色可能会更好，但这里保持原样，仅修复背景和文字
const colors = ['#bfdbfe', '#bae6fd', '#a7f3d0', '#a5f3fc', '#99f6e4', '#6ee7b7'];

const xScale = d3.scaleLinear().domain([0, 21]).range([padding.left, width - padding.right]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height - padding.bottom, padding.top]);

const stack = d3.stack().keys(keys);
const stackedData = stack(rawData);

const areaGenerator = d3.area()
  .x(d => xScale(d.data.age))
  .y0(d => yScale(d[0]))
  .y1(d => yScale(d[1]))
  .curve(d3.curveBasis);

const areaPaths = computed(() => {
  return stackedData.map((s, i) => ({
    d: areaGenerator(s),
    color: colors[i],
    key: s.key
  }));
});

/**
 * 核心逻辑：优化文字定位
 */
const dynamicLabels = computed(() => {
  return stackedData.map((s) => {
    // 1. 找到该系列最厚的区间范围
    let maxT = 0;
    s.forEach(d => maxT = Math.max(maxT, d[1] - d[0]));
    
    // 找出所有厚度接近最大厚度的点，取其中点（解决 15-18 岁这种平原地区的居中问题）
    const thickPoints = s.filter(d => (d[1] - d[0]) >= maxT * 0.95);
    const centerPoint = thickPoints[Math.floor(thickPoints.length / 2)];
    
    let x = xScale(centerPoint.data.age);
    let y = yScale(centerPoint[0] + (centerPoint[1] - centerPoint[0]) / 2);

    // 2. 边界避让逻辑
    // 如果在最左侧，向右挪一点；如果在最右侧，向左挪一点
    if (centerPoint.data.age === 0) x += 25;
    if (centerPoint.data.age === 21) x -= 35;

    return {
      name: keyMap[s.key],
      x, y,
      fontSize: maxT < 8 ? 0 : Math.min(18, maxT * 0.9)
    };
  });
});
</script>

<style scoped>
.card-container {
  max-width: 850px;
  background: var(--card);
  border-radius: 2rem;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.title { font-size: 2.5rem; margin: 0; color: var(--foreground); font-family: ui-serif, Georgia, serif; }
.subtitle { color: var(--muted-foreground); margin: 0.5rem 0 2rem 0; font-size: 1.1rem; }

.chart-svg { width: 100%; height: auto; overflow: visible; }

.area-path {
  transition: all 0.4s ease;
  cursor: pointer;
  stroke: var(--card);
  stroke-width: 0;
}
.area-path:hover {
  stroke-width: 3px;
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.1));
}
.areas:hover .area-path:not(:hover) {
  opacity: 0.4;
  filter: grayscale(0.4);
}

.area-label {
  fill: var(--foreground);
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle; /* 关键：确保文字垂直居中 */
  text-shadow: 0 0 4px var(--card);
  pointer-events: none;
}

.axis-text { font-size: 12px; fill: var(--muted-foreground); }

/* SVG elements theme support via classes */
.stroke-border {
  stroke: var(--border);
}
.stroke-border\/30 {
  stroke: oklch(var(--border) / 0.3);
}
</style>