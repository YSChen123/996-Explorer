<template>
  <div class="map-wrapper">
    <div ref="chartRef" class="map-chart"></div>
    <div v-if="loading" class="map-loading">地图数据加载中...</div>
    <div v-if="errorMsg" class="map-error">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import chinaGeoJson from '../assets/china.json'  // 从 components 相对到 assets
  

const chartRef = ref(null)
let chartInstance = null

const loading = ref(true)
const errorMsg = ref('')

// 这里先放一份假的按省岗位数据，后面你再替换成真数据
const provinceData = [
  { name: '北京市', value: 120 },
  { name: '上海市', value: 90 },
  { name: '广东省', value: 200 },
  { name: '浙江省', value: 150 },
  { name: '江苏省', value: 110 },
  { name: '四川省', value: 60 },
  { name: '湖北省', value: 45 },
  { name: '重庆市', value: 30 }
]

const initChart = () => {
  try {
    // 1. 注册地图（只需要注册一次）
    echarts.registerMap('china', chinaGeoJson)

    // 2. 初始化实例
    chartInstance = echarts.init(chartRef.value)

    // 3. 配置项
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
        bottom: '5%',
        text: ['多', '少'],
        calculable: true
      },
      geo: {
        map: 'china',
        roam: true,
        label: { show: false },
        itemStyle: {
          borderColor: '#999'
        },
        emphasis: {
          label: { show: true },
          itemStyle: { areaColor: '#f4e925' }
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
    loading.value = false

    window.addEventListener('resize', handleResize)
  } catch (e) {
    console.error(e)
    errorMsg.value = '地图加载失败，请检查 china.json 是否在 src/assets 目录下'
    loading.value = false
  }
}

const handleResize = () => {
  if (chartInstance) chartInstance.resize()
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
.map-wrapper {
  position: relative;
  width: 100%;
  height: 520px;
}

.map-chart {
  width: 100%;
  height: 100%;
}

.map-loading,
.map-error {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #6b7280;
  font-size: 14px;
}
.map-error {
  color: #b91c1c;
}
</style>
