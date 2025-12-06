<template>
  <div class="china-map-wrapper">
    <aside class="company-panel">
      <div class="company-panel-title">
        <div class="title-icon">💰</div>
        <div>
          <span class="main-title">真实薪资性价比</span>
          <span class="sub-title">圆越大 = 年底剩钱越多 (年薪 - 年成本)</span>
        </div>
      </div>
      <div class="company-list">
        <button
          v-for="c in companies"
          :key="c.key"
          class="company-item"
          :class="{ active: activeCompanyKey === c.key }"
          @click="activeCompanyKey = c.key"
          :style="{ '--company-color': c.color }" 
        >
          <div class="company-logo">
            <span>{{ c.badge }}</span>
          </div>
          <div class="company-text">
            <div class="company-header">
              <span class="company-name-zh">{{ c.nameZh }}</span>
              <span class="salary-tag">盈余Top: {{ getMaxSurplus(c.key) }}w</span>
            </div>
            <div class="company-extra">
              {{ c.hq }}总部 · Excel真实数据
            </div>
          </div>
          <div class="active-indicator"></div>
        </button>
      </div>
    </aside>

    <div class="map-panel">
      <v-chart class="map-chart" :option="mapOption" autoresize />
      
      <div class="map-legend card-glass">
        <div class="legend-title">图例说明</div>
        <div class="legend-row">
          <div class="legend-symbol size-symbol"></div>
          <span>圆圈大小 = <strong>年盈余</strong> (存下的钱)</span>
        </div>
        <div class="legend-row">
          <div class="legend-symbol color-gradient"></div>
          <span>颜色 = <strong>生活成本</strong> (蓝低 -> 红高)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
import chinaJson from '../assets/china.json' 

// 注册地图
if (!echarts.getMap('china')) {
  echarts.registerMap('china', chinaJson)
}

// ===== 1. 真实薪资数据 (来自 Excel CSV) =====
// 单位：万元/年
const realSalaryData = {
  'bytedance': { '北京': 117.36, '上海': 109.53, '深圳': 89.0,  '广州': 61.3 },
  'tencent':   { '北京': 152.8,  '上海': 109.52, '深圳': 94.41, '广州': 88.6 },
  'alibaba':   { '北京': 110.98, '上海': 107.42, '深圳': 110.5, '广州': 48.83 },
  'meituan':   { '北京': 100.47, '上海': 99.9,   '深圳': 72.89, '广州': 25.49 },
  'huawei':    { '北京': 136.75, '上海': 119.5,  '深圳': 102.7, '广州': 40.0 }
}

// ===== 2. 城市生活成本估算 (月成本 k -> 年成本 w) =====
// 计算公式：(月租房 + 月消费) * 12 / 10
const cityAnnualCost = {
  '上海': 17.4, 
  '北京': 16.2, 
  '深圳': 14.4, 
  '广州': 10.8 
}

// 城市经纬度
const cityCoordMap = {
  '北京': [116.40, 39.90], 
  '上海': [121.47, 31.23], 
  '广州': [113.27, 23.13],
  '深圳': [114.06, 22.55]
}

// 公司列表
const companies = [
  { key: 'bytedance', nameZh: '字节跳动', badge: '字', color: '#3b82f6', hq: '北京' }, // 调整为更亮的蓝
  { key: 'tencent',   nameZh: '腾讯',     badge: '腾', color: '#0052d9', hq: '深圳' }, // 腾讯蓝
  { key: 'alibaba',   nameZh: '阿里巴巴', badge: '阿', color: '#ff6a00', hq: '杭州' }, // 阿里橙
  { key: 'huawei',    nameZh: '华为',     badge: '菊', color: '#cf0a2c', hq: '深圳' }, // 华为红
  { key: 'meituan',   nameZh: '美团',     badge: '团', color: '#ffc300', hq: '北京' }  // 美团黄
]

// ===== 状态逻辑 =====
const activeCompanyKey = ref('bytedance')

const currentCompany = computed(() => 
  companies.find(c => c.key === activeCompanyKey.value) || companies[0]
)

// 计算最大盈余
const getMaxSurplus = (key) => {
  const salaries = realSalaryData[key] || {}
  let max = 0
  for (const [city, salary] of Object.entries(salaries)) {
    const cost = cityAnnualCost[city] || 10
    const surplus = salary - cost
    if (surplus > max) max = surplus
  }
  return max.toFixed(0)
}

const getCityCount = (key) => {
  return Object.keys(realSalaryData[key] || {}).length
}

// ===== Option 计算 =====
const mapOption = computed(() => {
  const company = currentCompany.value
  const salaryMap = realSalaryData[company.key] || {}
  
  // 1. 构造散点数据
  const scatterData = Object.keys(salaryMap)
    .filter(cityName => cityCoordMap[cityName]) 
    .map(cityName => {
      const annualSalary = salaryMap[cityName]
      const annualCost = cityAnnualCost[cityName] || 12.0 
      const annualSurplus = annualSalary - annualCost 
      
      return {
        name: cityName,
        // value: [经度, 纬度, 年盈余, 年成本, 年薪]
        value: [...cityCoordMap[cityName], annualSurplus, annualCost, annualSalary]
      }
    })

  return {
    backgroundColor: 'transparent', // 透明背景，由容器控制
    tooltip: {
      trigger: 'item',
      className: 'echarts-tooltip', // 使用自定义类名(虽然ECharts内联样式优先级高，但可尝试)
      backgroundColor: 'rgba(255, 255, 255, 0.85)', // 毛玻璃效果基底
      borderColor: 'rgba(255,255,255,0.5)',
      borderWidth: 1,
      padding: 16,
      textStyle: { color: '#333' },
      extraCssText: 'backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); border-radius: 12px;',
      formatter: params => {
        if (params.seriesType === 'scatter' || params.seriesType === 'effectScatter') {
          const [lng, lat, surplus, cost, salary] = params.value
          return `
            <div style="font-family: system-ui;">
              <div style="font-weight:700; font-size:16px; margin-bottom:8px; color:#1f2937; display:flex; align-items:center;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${company.color}; margin-right:8px;"></span>
                ${company.nameZh} · ${params.name}
              </div>
              <div style="font-size:13px; color:#4b5563; line-height:1.8; background:rgba(243,244,246,0.5); padding:8px; border-radius:8px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>💰 年薪总包</span> 
                  <span style="font-weight:600; color:#111827">${salary}w</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                  <span>💸 年生活成本</span> 
                  <span style="color:#ef4444">-${cost.toFixed(1)}w</span>
                </div>
                <div style="border-top:1px dashed #d1d5db; margin-top:4px; padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-weight:600;">🎉 年盈余(存)</span> 
                  <span style="color:#059669; font-weight:800; font-size:18px;">${surplus.toFixed(1)}w</span>
                </div>
              </div>
            </div>
          `
        }
        return params.name
      }
    },
    // 视觉映射：更美观的渐变
    visualMap: {
      show: true,
      left: '20',
      bottom: '20',
      dimension: 3, // 使用 value[3] (年成本)
      min: 10,      
      max: 18,      
      text: ['成本高', '成本低'],
      textStyle: { color: '#6b7280', fontSize: 12 },
      inRange: {
        // 青 -> 黄 -> 橙 -> 红
        color: ['#34d399', '#facc15', '#fb923c', '#ef4444'] 
      },
      calculable: true,
      itemWidth: 15,
      itemHeight: 100,
      backgroundColor: 'rgba(255,255,255,0.8)',
      padding: 10,
      borderRadius: 8,
      borderColor: 'rgba(0,0,0,0.05)',
      borderWidth: 1
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.8,
      center: [113, 30], // 聚焦东南沿海
      label: { show: true, fontSize: 10, color: 'rgba(0,0,0,0.3)' }, // 淡淡的省份名
      itemStyle: {
        areaColor: '#f1f5f9', // 更有质感的灰蓝白
        borderColor: '#cbd5e1',
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 10,
        shadowOffsetY: 4
      },
      emphasis: {
        itemStyle: {
          areaColor: '#dbeafe', // 选中时的极光蓝
          borderColor: '#3b82f6',
          borderWidth: 1.5
        },
        label: { show: true, color: '#1e40af' }
      }
    },
    series: [
      // 1. 涟漪特效：高盈余城市 (>80w) - 强调
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: { 
          brushType: 'stroke', 
          scale: 4,
          period: 4 
        },
        // 大小映射
        symbolSize: val => Math.max(12, (val[2] - 20) / 2.8),
        itemStyle: {
          color: company.color,
          shadowBlur: 10,
          shadowColor: company.color
        },
        data: scatterData.filter(d => d.value[2] > 80)
      },
      // 2. 实体散点：所有城市
      {
        name: '性价比',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        symbolSize: val => Math.max(12, (val[2] - 20) / 2.8),
        label: {
          show: true,
          position: 'top',
          formatter: '{b}',
          color: '#374151',
          fontSize: 12,
          fontWeight: 600,
          backgroundColor: 'rgba(255,255,255,0.85)',
          padding: [4, 8],
          borderRadius: 4,
          shadowColor: 'rgba(0,0,0,0.1)',
          shadowBlur: 4,
          distance: 10
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.2)',
          opacity: 0.9
        },
        data: scatterData
      }
    ]
  }
})
</script>

<style scoped>
.china-map-wrapper {
  display: flex;
  gap: 20px;
  height: 640px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  box-sizing: border-box;
  border: 1px solid #f3f4f6;
  font-family: system-ui, -apple-system, sans-serif;
}

/* 左侧面板美化 */
.company-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.company-panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.title-icon {
  font-size: 24px;
  background: #fffbeb;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.main-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.sub-title {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.company-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

/* 列表项美化 */
.company-item {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.company-item:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.company-item.active {
  background: #eff6ff;
  border-color: var(--company-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.active-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--company-color);
  opacity: 0;
  transition: opacity 0.3s;
}

.company-item.active .active-indicator {
  opacity: 1;
}

.company-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
  transition: all 0.3s;
}

.company-item.active .company-logo {
  background: var(--company-color);
  color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.company-text {
  flex: 1;
  text-align: left;
}

.company-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.company-name-zh {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.salary-tag {
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 4px;
}

.company-extra {
  font-size: 11px;
  color: #9ca3af;
}

/* 右侧地图面板 */
.map-panel {
  flex: 1;
  position: relative;
  background: #fcfcfc; /* 纯净背景 */
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.map-chart {
  width: 100%;
  height: 100%;
}

/* 悬浮图例 - 毛玻璃风格 */
.card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.map-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 16px;
  border-radius: 12px;
  font-size: 12px;
  color: #4b5563;
  width: 180px;
}

.legend-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  font-size: 13px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 8px;
}

.legend-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.legend-row:last-child {
  margin-bottom: 0;
}

.legend-symbol {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  flex-shrink: 0;
}

.size-symbol {
  border-radius: 50%;
  background: #e5e7eb;
  border: 2px solid #9ca3af;
  transform: scale(0.6);
  position: relative;
}
.size-symbol::after {
  content: '';
  position: absolute;
  top: -6px; left: -6px;
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 1px dashed #d1d5db;
  transform: scale(1.5);
}

.color-gradient {
  height: 8px;
  width: 40px;
  border-radius: 4px;
  background: linear-gradient(to right, #34d399, #facc15, #ef4444);
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>