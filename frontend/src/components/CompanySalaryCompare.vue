<template>
      <!-- 图 1：研发岗年薪区间分布 -->
    <section class="card">
      <div class="card-header">
        <h2>研发岗年薪区间分布（估算）</h2>
        <p>
          根据「大厂薪资地图 - 研发岗」中不同年薪档位的岗位分布，整理成 10-25W / 25-50W / 50-70W /
          70-120W / 120W+ 的占比示意。
        </p>
      </div>
      <div class="chart-wrapper">
         <v-chart class="chart" :option="bandOption" autoresize />
      </div>
    </section>

  <div class="company-compare">
    <!-- 图 2：应届技术岗年薪对比 -->
    <section class="card">
      <div class="card-header">
        <h2>应届技术岗年薪对比（估算）</h2>
        <p>
          根据「大厂薪资地图 - 应届毕业」中技术岗月薪区间 × 月数，取区间中值估算年薪（单位：万元/年），
          仅用于可视化示意。
        </p>
      </div>
      <div class="chart-wrapper">
          <v-chart class="chart" :option="gradOption" autoresize />
      </div>
    </section>
      </div>
</template>

<script setup>
import { ref } from 'vue'

const companies = [
  '腾讯',
  '字节跳动',
  '阿里巴巴',
  '拼多多',
  '小米',
  '网易',
  '美团',
  '京东',
  '百度'
]

// 图 1：应届技术岗年薪中值（万/年），根据图大致估出来，只作可视化用
const gradAnnual = [40, 48, 44, 36, 38, 34, 42, 36, 40]

const gradOption = ref({
  grid: { left: 80, right: 30, top: 30, bottom: 30 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (v) => `${v} 万/年`
  },
  xAxis: {
    type: 'value',
    name: '年薪中值（万/年）',
    nameLocation: 'middle',
    nameGap: 40,
    axisLine: { lineStyle: { color: '#9ca3af' } },
    axisLabel: { color: '#6b7280' },
    splitLine: { lineStyle: { color: '#e5e7eb' } }
  },
  yAxis: {
    type: 'category',
    data: companies,
    axisLine: { lineStyle: { color: '#9ca3af' } },
    axisLabel: { color: '#374151' }
  },
  series: [
    {
      type: 'bar',
      data: gradAnnual,
      barWidth: 18,
      itemStyle: {
        borderRadius: [4, 4, 4, 4],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#4f46e5' },
            { offset: 1, color: '#22c55e' }
          ]
        }
      }
    }
  ]
})

// 图 2：研发岗不同年薪档位占比（%），五个档位
const salaryBands = ['10-25W', '25-50W', '50-70W', '70-120W', '120W+']

const bandSeriesData = {
  '10-25W': [5, 4, 6, 10, 8, 7, 6, 7, 6],
  '25-50W': [40, 38, 36, 45, 42, 40, 38, 40, 38],
  '50-70W': [30, 32, 30, 25, 28, 30, 30, 30, 32],
  '70-120W': [20, 22, 22, 15, 18, 20, 22, 19, 20],
  '120W+': [5, 4, 6, 5, 4, 3, 4, 4, 4]
}

const bandOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (v) => `${v}%`
  },
  legend: {
    top: 8,
    textStyle: { color: '#374151', fontSize: 11 }
  },
  grid: { left: 80, right: 20, top: 40, bottom: 40 },
  xAxis: {
    type: 'value',
    name: '岗位占比（%）',
    nameLocation: 'middle',
    nameGap: 35,
    axisLine: { lineStyle: { color: '#9ca3af' } },
    axisLabel: { color: '#6b7280' },
    splitLine: { lineStyle: { color: '#e5e7eb' } }
  },
  yAxis: {
    type: 'category',
    data: companies,
    axisLine: { lineStyle: { color: '#9ca3af' } },
    axisLabel: { color: '#374151' }
  },
  series: salaryBands.map((band, idx) => ({
    name: band,
    type: 'bar',
    stack: 'total',
    barWidth: 16,
    emphasis: { focus: 'series' },
    itemStyle: {
      borderRadius: idx === salaryBands.length - 1 ? [4, 4, 4, 4] : 0
    },
    data: bandSeriesData[band]
  }))
})
</script>

<style scoped>
.company-compare {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 18px 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.03);
}

.card-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.card-header p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.chart-wrapper {
  margin-top: 10px;
  width: 100%;
}

/* 真正控制图表大小的是这个 .chart */
.chart {
  width: 100%;
  height: 300px;
}

@media (max-width: 900px) {
  .chart {
    height: 260px;
  }
}
</style>

