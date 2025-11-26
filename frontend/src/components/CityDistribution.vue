<template>
  <div class="page">
    <h1 class="page-title">城市与地域视角</h1>
    <p class="page-subtitle">
      分析不同城市中的大厂岗位分布与“性价比”。
    </p>

    <!-- 图 0：中国地图 -->
    <section class="card">
      <h2 class="card-title">中国大厂办公城市分布地图</h2>
      <p class="card-desc">
        以全国地图为底，叠加 9 家互联网大厂在各城市的覆盖情况。
      </p>
      <!-- ✅ 用我们单独封装好的 ChinaMap 组件 -->
      <ChinaMap />
    </section>

    <!-- 图 1：城市覆盖热度条形图 -->
    <section class="card">
      <h2 class="card-title">大厂办公城市覆盖热度</h2>
      <p class="card-desc">
        统计 9 家互联网大厂在各城市设点的情况，柱子的高度代表「有多少家公司在这个城市有办公点」。
      </p>
      <div class="chart-wrapper">
        <v-chart class="chart" :option="cityBarOption" autoresize />
      </div>
    </section>

    <!-- 图 2：一线 vs 新一线城市能级对比 -->
    <section class="card">
      <h2 class="card-title">一线 / 新一线城市能级对比</h2>
      <p class="card-desc">
        将所有「公司-城市」出现次数汇总到城市能级：一线（北京 / 上海 / 广州 / 深圳）、
        新一线（杭州 / 南京 / 成都 / 武汉 / 天津 / 厦门），反映大厂对不同城市层级的布局倾向。
      </p>
      <div class="chart-wrapper half">
        <v-chart class="chart" :option="tierPieOption" autoresize />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChinaMap from './ChinaMap.vue'   // ✅ 同目录相对路径引入

// 下面这些只给柱状图和饼图用，不再自己画地图了
const cityNames = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '武汉',
  '南京',
  '天津',
  '厦门'
]

const cityCompanyCounts = [8, 8, 6, 5, 5, 5, 3, 2, 1, 1]

// 图 1：城市覆盖热度条形图
const cityBarOption = ref({
  grid: { left: 80, right: 30, top: 30, bottom: 30 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    valueFormatter: (v) => `${v} 家`
  },
  xAxis: {
    type: 'value',
    name: '覆盖公司数量（家）',
    nameLocation: 'middle',
    nameGap: 40,
    axisLine: { lineStyle: { color: '#9ca3af' } },
    axisLabel: { color: '#6b7280' },
    splitLine: { lineStyle: { color: '#e5e7eb' } }
  },
  yAxis: {
    type: 'category',
    data: cityNames,
    axisLine: { lineStyle: { color: '#9ca3af' } },
    axisLabel: { color: '#374151' }
  },
  series: [
    {
      type: 'bar',
      data: cityCompanyCounts,
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

// 图 2：城市能级饼图
const tierPieOption = ref({
  tooltip: {
    trigger: 'item',
    valueFormatter: (v) => `${v} 次`
  },
  legend: {
    bottom: 4,
    textStyle: { color: '#374151', fontSize: 11 }
  },
  series: [
    {
      name: '城市能级',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        formatter: '{b}\n{d}%',
        color: '#374151'
      },
      data: [
        {
          name: '一线城市（北上广深）',
          value: 27
        },
        {
          name: '新一线城市（杭 / 成 / 武 / 宁 / 天 / 厦）',
          value: 17
        }
      ]
    }
  ]
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #111827;
}

.page-subtitle {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 18px 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.03);
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.card-desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.chart-wrapper {
  margin-top: 10px;
  width: 100%;
}

.chart-wrapper.half {
  max-width: 480px;
}

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
