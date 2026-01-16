<template>
  <div class="card-container">
    <div class="header">
      <h2 class="title">LifeFlow</h2>
      <p class="subtitle">
        从内向无趣的小镇做题家到大胆探索实际，探索自己，培养兴趣，热爱生活。
        <br />
        这是我 21 年来的时间分配轨迹。
      </p>
    </div>

    <!-- 绘图区域 -->
    <svg :viewBox="`0 0 ${width} ${height}`" class="chart-svg">
      <!-- 1. 背景网格线/坐标轴 -->
      <g class="axis-grid">
        <line v-for="tick in yTicks" :key="'y'+tick" 
          :x1="padding.left" :y1="yScale(tick)" :x2="width" :y2="yScale(tick)" 
          stroke="#eee" stroke-dasharray="4" />
        <text v-for="tick in yTicks" :key="'yt'+tick" 
          :x="padding.left - 10" :y="yScale(tick)" class="axis-text" text-anchor="end">
          {{ tick }}%
        </text>
      </g>

      <!-- 2. 面积色块层 -->
      <g class="areas">
        <path
          v-for="(path, index) in areaPaths"
          :key="'path'+index"
          :d="path.d"
          :fill="path.color"
          class="area-path"
        />
      </g>

      <!-- 3. 动态文字标签 (计算色块中心) -->
      <g class="labels" pointer-events="none">
        <text
          v-for="(label, index) in dynamicLabels"
          :key="'label'+index"
          :x="label.x"
          :y="label.y"
          class="area-label"
          :style="{ fontSize: label.fontSize + 'px' }"
        >
          {{ label.name }}
        </text>
      </g>

      <!-- 4. X 轴刻度 (年龄) -->
      <g class="x-axis">
        <line :x1="padding.left" :y1="height - padding.bottom" :x2="width" :y2="height - padding.bottom" stroke="#ccc" />
        <g v-for="age in [0, 5, 12, 18, 21]" :key="age" :transform="`translate(${xScale(age)}, ${height - padding.bottom})`">
          <line y2="6" stroke="#ccc" />
          <text y="20" class="axis-text" text-anchor="middle">{{ age }}</text>
        </g>
        <text :x="width / 2 + padding.left" :y="height - 5" class="axis-text" font-weight="bold">Age</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import * as d3 from 'd3';

// 图表尺寸配置
const width = 600;
const height = 350;
const padding = { top: 20, right: 20, bottom: 40, left: 50 };

/**
 * 1. 数据建模 (基于你的描述)
 * 学习, 游戏, 社交, Coding, 书法, 摄影
 */
const rawData = [
  { age: 0,  study: 30, game: 50, social: 20, coding: 0,  calligraphy: 0, photo: 0 },
  { age: 6,  study: 30, game: 50, social: 20, coding: 0,  calligraphy: 0, photo: 0 },
  { age: 12, study: 35, game: 45, social: 20, coding: 0,  calligraphy: 0, photo: 0 },
  // 12-18岁：典型做题家巅峰，学习占比极大
  { age: 15, study: 85, game: 10, social: 5,  coding: 0,  calligraphy: 0, photo: 0 },
  { age: 18, study: 85, game: 5,  social: 10, coding: 0,  calligraphy: 0, photo: 0 },
  // 18-21岁：大学开枝散叶
  { age: 19, study: 40, game: 10, social: 15, coding: 15, calligraphy: 10, photo: 10 },
  { age: 21, study: 25, game: 5,  social: 15, coding: 25, calligraphy: 15, photo: 15 },
];

const keys = ['study', 'game', 'coding', 'calligraphy', 'photo', 'social'];
const keyMap = { 
  study: '学习', game: '游戏', coding: 'Coding', 
  calligraphy: '书法', photo: '摄影', social: '社交' 
};
const colors = ['#bfdbfe', '#bae6fd', '#a5f3fc', '#99f6e4', '#6ee7b7', '#a7f3d0'];

// 2. 定义比例尺
const xScale = d3.scaleLinear().domain([0, 21]).range([padding.left, width]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height - padding.bottom, padding.top]);
const yTicks = [20, 40, 60, 80];

// 3. 计算堆叠路径
const stack = d3.stack().keys(keys);
const stackedData = stack(rawData);

const areaGenerator = d3.area()
  .x(d => xScale(d.data.age))
  .y0(d => yScale(d[0]))
  .y1(d => yScale(d[1]))
  .curve(d3.curveBasis); // 极简流体曲线

const areaPaths = computed(() => {
  return stackedData.map((s, i) => ({
    d: areaGenerator(s),
    color: colors[i],
    key: s.key
  }));
});

/**
 * 4. 自动计算文字位置逻辑
 * 原理：找到该系列在整个 X 轴上“最厚”的点，将文字放在该点的垂直中心
 */
const dynamicLabels = computed(() => {
  return stackedData.map((s) => {
    // 找到当前 key 贡献最大的数据点
    let maxThickness = -1;
    let bestPoint = null;

    s.forEach(d => {
      const thickness = d[1] - d[0];
      if (thickness > maxThickness) {
        maxThickness = thickness;
        bestPoint = d;
      }
    });

    return {
      name: keyMap[s.key],
      x: xScale(bestPoint.data.age),
      y: yScale(bestPoint[0] + (bestPoint[1] - bestPoint[0]) / 2),
      fontSize: maxThickness < 10 ? 0 : Math.min(16, maxThickness * 1.2) // 动态调整字号，太窄不显示
    };
  });
});
</script>

<style scoped>
.card-container {
  max-width: 700px;
  background: white;
  border-radius: 2rem;
  padding: 2.5rem;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.title { font-size: 2.5rem; margin: 0; color: #1e293b; font-family: 'serif'; }
.subtitle { color: #64748b; margin: 1rem 0 2rem 0; line-height: 1.6; }

.chart-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.area-path {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  stroke: white;
  stroke-width: 0;
}

.area-path:hover {
  stroke-width: 3px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));
  opacity: 1;
}

/* 整体悬浮时，非 hover 区域变淡 */
.areas:hover .area-path:not(:hover) {
  opacity: 0.5;
  filter: grayscale(0.3);
}

.area-label {
  fill: #334155;
  font-weight: 500;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  /* 增加微弱文字发光，确保在深色区也清晰 */
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

.axis-text {
  font-size: 12px;
  fill: #94a3b8;
}
</style>