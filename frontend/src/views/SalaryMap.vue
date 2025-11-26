<template>
  <div class="salary-map-page">
    <h2>中国互联网大厂岗位分布</h2>
    <div ref="chartRef" class="map-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
let chartInstance = null

// 假装有一份按省统计的岗位数据，你之后可以从接口/本地 JSON 替换
const provinceData = [
  { name: '北京市', value: 120 },
  { name: '上海市', value: 98 },
  { name: '广东省', value: 200 },
  { name: '浙江省', value: 150 },
  { name: '江苏省', value: 110 },
  // ... 其他省份按需补上
]

const initChart = async () => {
  // 1. 读取 public 下的 china.json
  const res = await fetch('/china.json')
  const chinaGeoJson = await res.json()

  // 2. 注册地图
  echarts.registerMap('china', chinaGeoJson)

  // 3. 初始化实例
  chartInstance = echarts.init(chartRef.value)

  // 4. 配置项
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: params => {
        const { name, value } = params
        return `${name}<br/>岗位数：${value ?? 0}`
      }
    },
    visualMap: {
      min: 0,
      max: 250,
      left: 'left',
      bottom: '10%',
      text: ['多', '少'],
      calculable: true
    },
    geo: {
      map: 'china',
      roam: true,
      label: {
        show: false
      },
      itemStyle: {
        borderColor: '#999'
      },
      emphasis: {
        label: { show: true },
        itemStyle: {
          areaColor: '#f4e925'
        }
      }
    },
    series: [
      {
        name: '岗位数',
        type: 'map',
        map: 'china',
        geoIndex: 0,
        data: provinceData
      }
    ]
  }

  chartInstance.setOption(option)

  // 5. 跟随窗口大小自适应
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.salary-map-page {
  padding: 16px;
}

h2 {
  margin-bottom: 16px;
}

.map-chart {
  width: 100%;
  height: 600px; /* 你可以根据页面布局再调 */
}
</style>
