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

  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as echarts from 'echarts'
import ChinaMap from './ChinaMap.vue'   

// 对应每个城市被多少家公司覆盖
// 按 9 家大厂真实覆盖城市统计

const cityNames = [
  '北京',
  '上海',
  '成都',
  '广州',
  '深圳',
  '西安',
  '南京',
  '杭州'
]
const cityCompanyCounts = [8, 8, 6, 5, 5, 4, 4, 3]

// 排序 + 一些统计量
const sortedCityData = cityNames
  .map((name, idx) => ({ name, value: cityCompanyCounts[idx] }))
  .sort((a, b) => b.value - a.value)

const maxCoverage = Math.max(...sortedCityData.map(d => d.value)) || 1
const avgCoverage =
  sortedCityData.reduce((sum, d) => sum + d.value, 0) / sortedCityData.length


const podiumLayout = (() => {
  const n = sortedCityData.length
  const res = new Array(n)

  const center = Math.floor((n - 1) / 2) // 8 个时 = 3，冠军在中间
  let left = center - 1
  let right = center + 1
  let useLeftNext = true

  sortedCityData.forEach((d, i) => {
    const rank = i + 1
    if (i === 0) {
      // 冠军放中间
      res[center] = { ...d, rank }
    } else {
      // 之后的名次左右交替排，注意别越界
      if ((useLeftNext && left >= 0) || right >= n) {
        res[left] = { ...d, rank }
        left--
      } else {
        res[right] = { ...d, rank }
        right++
      }
      useLeftNext = !useLeftNext
    }
  })

  return res
})()

// 领奖台柱状图
const cityBarOption = ref({
  backgroundColor: 'transparent',
  grid: {
    left: 10,      // 往两边缩一点，让台子更挤在中间
    right: 10,
    top: 40,
    bottom: 60
  },
  xAxis: {
    type: 'category',
    data: podiumLayout.map(d => d.name),
    boundaryGap: true,
    axisTick: {
      show: false,
      alignWithLabel: true
    },
    axisLine: { show: false },
    axisLabel: {
      color: '#374151',
      fontSize: 12,
      margin: 12
    }
  },
  yAxis: {
    // 你原来的 yAxis 配置保持不变
    type: 'value',
    min: 0,
    max: maxCoverage + 1,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#9ca3af',
      fontSize: 11
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: '#e5e7eb',
        type: 'dashed'
      }
    }
  },
  series: [
    {
      name: '覆盖公司数',
      type: 'bar',
      // 关键：柱子要粗 & 之间没有空隙
      barWidth: '80%',        // 每个类别里占 80% 宽
      barCategoryGap: '0%',   // 类别之间不留缝
      barGap: '0%',           // 系列之间不留缝（虽然这里只有一个系列）
      data: podiumLayout.map(p => {
        const rank = p.rank
        let color
        if (rank === 1) {
          color = new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: '#FDE68A' },
            { offset: 1, color: '#F59E0B' }
          ])
        } else if (rank === 2) {
          color = new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: '#E5E7EB' },
            { offset: 1, color: '#9CA3AF' }
          ])
        } else if (rank === 3) {
          color = new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: '#FED7AA' },
            { offset: 1, color: '#EA580C' }
          ])
        } else {
          color = new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: '#BFDBFE' },
            { offset: 1, color: '#22C55E' }
          ])
        }

        return {
          value: p.value,
          rank,
          itemStyle: {
            color,
            // 更像台阶：上面微圆角，下面直角
            borderRadius: [6, 6, 0, 0],
            shadowBlur: rank <= 3 ? 18 : 6,
            shadowColor:
              rank === 1
                ? 'rgba(245,158,11,0.45)'
                : rank === 2
                ? 'rgba(148,163,184,0.45)'
                : rank === 3
                ? 'rgba(234,88,12,0.4)'
                : 'rgba(59,130,246,0.25)'
          }
        }
      }),
      label: {
        show: true,
        position: 'top',
        formatter: params => `NO.${params.data.rank}\n${params.value} 家`,
        color: '#111827',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 16
      },
      markLine: {
        symbol: 'none',
        lineStyle: {
          type: 'dashed',
          color: '#f97316',
          width: 1.2
        },
        label: {
          show: true,
          position: 'insideEndTop',
          formatter: `平均覆盖：${avgCoverage.toFixed(1)} 家`,
          color: '#111827',
          fontSize: 11,
          backgroundColor: 'rgba(254,243,199,0.96)',
          padding: [3, 8],
          borderRadius: 999,
          fontWeight: 600,
          lineHeight: 16
        },
        data: [{ yAxis: avgCoverage }]
      }
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
