<template>
  <div class="salary-edu-exp-chart">
    <section class="card main-card">
      <div class="card-header">
        <div class="header-title">
          <h2>大厂薪资全景：晋升路径 vs 学历溢价</h2>
        </div>
      </div>
      <div class="chart-wrapper">
        <v-chart class="chart" :option="combinedOption" autoresize />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import * as echarts from 'echarts'

// ---------------------------------------------------------
// 1. 核心数据定义 (已根据 CSV 高薪样本修正)
// ---------------------------------------------------------

const companies = ['华为', '字节', '阿里', '腾讯', '美团']

// 修正后的职级趋势 - 更贴近 CSV 中的高薪样本
const careerPaths = {
  '华为': {
    color: '#ef4444', 
    // CSV参考: 15级~45w, 16级~60-70w, 17级~80-100w, 18级~150w+
    lineData: [[1, 35], [3, 48], [5, 70], [8, 100], [12, 160]], 
    levels: [
      { coord: [1, 35], name: '13级' },
      { coord: [3, 48], name: '15级' },
      { coord: [5, 70], name: '16级' },
      { coord: [8, 100], name: '17级' },
      { coord: [12, 160], name: '18级' } // 修正：大幅上调
    ]
  },
  '字节': { 
    color: '#3b82f6', 
    // CSV参考: 1-2~48w, 2-1~60-80w, 2-2~100w+, 3-1~200w+ (CSV有223w样本)
    lineData: [[1, 48], [3, 75], [5, 110], [7, 160], [10, 210]],
    levels: [
      { coord: [1, 48], name: '1-2' },
      { coord: [3, 75], name: '2-1' },
      { coord: [5, 110], name: '2-2' }, // 修正：上调
      { coord: [7, 160], name: '3-1' }  // 修正：大幅上调
    ]
  },
  '阿里': { 
    color: '#f97316', 
    // CSV参考: P5~48w, P6~60-80w, P7~100w+, P8~267w (CSV样本)
    lineData: [[1, 48], [4, 75], [7, 120], [10, 220]],
    levels: [
      { coord: [1, 48], name: 'P5' }, // 修正：CSV中P5约48w
      { coord: [4, 75], name: 'P6' },
      { coord: [7, 120], name: 'P7' },
      { coord: [10, 220], name: 'P8' } // 修正：逼近CSV中的267w高点
    ]
  },
  '腾讯': {
    color: '#10b981', 
    // CSV参考: 样本方差极大，有2年440w，也有10年200w+。整体拉高曲线。
    lineData: [[1, 45], [4, 90], [8, 160], [12, 230]],
    levels: [
      { coord: [1, 45], name: '5-7级' },
      { coord: [4, 90], name: '9级' },
      { coord: [8, 160], name: '10级' },
      { coord: [12, 230], name: '11级' } // 修正：体现高年限的高溢价
    ]
  },
  '美团': {
    color: '#eab308', 
    // CSV参考: L5~35w, L7~70-80w, L8~92-171w
    lineData: [[1, 35], [3, 55], [6, 80], [9, 130]],
    levels: [
      { coord: [1, 35], name: 'L5' },
      { coord: [3, 55], name: 'L6' },
      { coord: [6, 80], name: 'L7' },
      { coord: [9, 130], name: 'L8' } // 修正：取CSV L8区间中高位
    ]
  }
}

// 学历数据保持不变 (基于 Python 算术平均，准确)
const eduData = {
  bachelor: [75.9, 104.0, 87.6, 128.2, 57.5], 
  master:   [59.3, 83.8, 91.4, 91.7, 73.9]
}

// ---------------------------------------------------------
// 2. ECharts 配置
// ---------------------------------------------------------
const combinedOption = computed(() => {
  const series = []

  // 左侧：晋升折线 + 气泡
  Object.keys(careerPaths).forEach(company => {
    const data = careerPaths[company]
    
    // 曲线
    series.push({
      name: company,
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: data.lineData,
      smooth: 0.3, // 稍微调低平滑度，体现薪资跃升的陡峭感
      symbol: 'none',
      lineStyle: { width: 3, shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.1)' },
      itemStyle: { color: data.color },
      areaStyle: {
        opacity: 0.05,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: data.color },
          { offset: 1, color: '#fff' }
        ])
      }
    })

    // 职级气泡
    series.push({
      name: company,
      type: 'scatter',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: data.levels.map(l => ({ value: l.coord, name: l.name })),
      symbolSize: 28,
      itemStyle: {
        color: '#fff',
        borderColor: data.color,
        borderWidth: 2,
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowBlur: 5
      },
      label: {
        show: true,
        formatter: (p) => p.data.name,
        fontSize: 9,
        fontWeight: 'bold',
        color: '#4b5563'
      },
      tooltip: {
        formatter: (p) => `<b>${company} - ${p.data.name}</b><br>年限: ${p.value[0]}年<br>参考薪资: ${p.value[1]}万`
      },
      z: 10
    })
  })

  // 右侧：学历柱状
  series.push({
    name: '本科平均',
    type: 'bar',
    xAxisIndex: 1,
    yAxisIndex: 1,
    data: eduData.bachelor,
    barWidth: 12,
    itemStyle: { color: '#a5b4fc', borderRadius: [4, 4, 0, 0], opacity: 0.8 },
    label: { show: false }
  })
  series.push({
    name: '硕士平均',
    type: 'bar',
    xAxisIndex: 1,
    yAxisIndex: 1,
    data: eduData.master,
    barWidth: 12,
    barGap: '20%',
    itemStyle: { color: '#4f46e5', borderRadius: [4, 4, 0, 0] },
    label: { show: false }
  })

  return {
    tooltip: { trigger: 'item' },
    legend: [
      { data: companies, top: 0, left: 20, icon: 'circle', itemGap: 15 },
      { data: ['本科平均', '硕士平均'], top: 0, right: 20, icon: 'roundRect' }
    ],
    grid: [
      { left: '5%', right: '32%', bottom: '10%', top: '15%', containLabel: true },
      { left: '73%', right: '2%', bottom: '10%', top: '15%', containLabel: true }
    ],
    xAxis: [
      {
        type: 'value',
        gridIndex: 0,
        name: '工作年限 (年)',
        nameLocation: 'middle',
        nameGap: 25,
        min: 0,
        max: 13,
        splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f3f4f6' } },
        axisLine: { lineStyle: { color: '#9ca3af' } },
        axisLabel: { color: '#6b7280' }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: companies,
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { color: '#e5e7eb' } },
        axisLabel: { interval: 0, rotate: 45, color: '#4b5563', fontSize: 10, margin: 14 }
      }
    ],
    yAxis: [
      {
        type: 'value',
        gridIndex: 0,
        name: '年总包 (万)',
        max: 250, // 修正：最大值调高至 250万，以容纳阿里 P8 和腾讯高职级
        splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } },
        axisLabel: { color: '#6b7280' }
      },
      {
        type: 'value',
        gridIndex: 1,
        max: 250, // 保持同步
        show: false
      }
    ],
    series: series
  }
})
</script>

<style scoped>
.salary-edu-exp-chart {
  display: flex;
  flex-direction: column;
}
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #f3f4f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}
.card:hover { box-shadow: 0 12px 20px -6px rgba(0, 0, 0, 0.06); }
.card-header { margin-bottom: 20px; }
.header-title { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.tag {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: #fff;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
}
.card-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #111827; }
.card-header p { margin: 6px 0 0; font-size: 13px; color: #6b7280; line-height: 1.6; }
.chart-wrapper { width: 100%; }
.chart { width: 100%; height: 450px; }
@media (max-width: 640px) { .chart { height: 400px; } }
</style>