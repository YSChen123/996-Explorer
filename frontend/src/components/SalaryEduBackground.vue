<template>
  <div class="salary-edu-exp-chart">
    <section class="card main-card">
      <div class="card-header">
        <div class="header-top">
          <div class="header-title">
            <h2>大厂工龄、职位与薪资图</h2>
          </div>
        </div>

        <div class="control-panel">
          <span class="panel-label">选择公司进行 PK (点击切换)：</span>
          <div class="chip-group">
            <button
              v-for="company in allCompanies"
              :key="company"
              class="company-chip"
              :class="{ active: selectedCompanies.includes(company) }"
              :style="getChipStyle(company)"
              @click="toggleCompany(company)"
            >
              <span 
                class="indicator"
                :style="{ background: getCompanyColor(company), boxShadow: selectedCompanies.includes(company) ? `0 0 8px ${getCompanyColor(company)}` : 'none' }"
              >
                <span v-if="selectedCompanies.includes(company)" class="check-mark">✓</span>
              </span>
              <span class="chip-text">{{ company }}</span>
            </button>
          </div>
        </div>

        <p class="desc">
          当前展示 <strong>{{ selectedCompanies.length }}</strong> 条路径。
        </p>
      </div>

      <div class="chart-wrapper">
        <v-chart class="chart" :option="chartOption" autoresize />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'

// ---------------------------------------------------------
// 1. 数据定义 (9家大厂全集 - 已移除拼多多)
// ---------------------------------------------------------

const allCompanies = ['华为', '字节跳动', '阿里', '腾讯', '美团', '小米', '百度', '京东', '网易']
const selectedCompanies = ref(['华为', '字节跳动', '腾讯']) 

const careerPaths = {
  '华为': {
    color: '#ef4444', 
    gradColor: ['#fee2e2', '#ef4444'],
    labelPos: 'top',
    levels: [
      { coord: [0.4, 28], name: '13级' }, 
      { coord: [1.1, 35], name: '14级' }, 
      { coord: [3.3, 45], name: '15级' }, 
      { coord: [4.8, 65], name: '16级' }, 
      { coord: [6.9, 90], name: '17级' }, 
      { coord: [7.9, 116], name: '18级' }, 
      { coord: [13.0, 188], name: '19级' }
    ]
  },
  '字节跳动': { 
    color: '#3b82f6', 
    gradColor: ['#dbeafe', '#3b82f6'],
    labelPos: 'bottom', 
    levels: [
      { coord: [0.2, 41], name: '1-1' }, 
      { coord: [0.5, 47], name: '1-2' }, 
      { coord: [2.7, 73], name: '2-1' }, 
      { coord: [4.9, 93], name: '2-2' }, 
      { coord: [5.0, 167], name: '3-1' }, 
      { coord: [12.0, 216], name: '3-2' }
    ]
  },
  '阿里': { 
    color: '#f97316', 
    gradColor: ['#ffedd5', '#f97316'],
    labelPos: 'bottom', 
    levels: [
      { coord: [0.0, 48], name: 'P5' }, 
      { coord: [3.5, 109], name: 'P7' }, 
      { coord: [9.0, 240], name: 'P8' }
    ]
  },
  '腾讯': {
    color: '#10b981', 
    gradColor: ['#d1fae5', '#10b981'],
    labelPos: 'left', 
    levels: [
      { coord: [0.0, 14], name: '4级' }, 
      { coord: [0.5, 38], name: '5级' }, 
      { coord: [1.0, 83], name: '6级' }, 
      { coord: [2.0, 118], name: '8级' }, 
      { coord: [2.5, 440], name: '14级' }, 
      { coord: [7.0, 136], name: 'T10' }, 
      { coord: [9.0, 180], name: '11级' }, 
      { coord: [10.0, 208], name: '12级' }
    ].sort((a, b) => a.coord[0] - b.coord[0])
  },
  '美团': {
    color: '#eab308', 
    gradColor: ['#fef9c3', '#eab308'],
    labelPos: 'top', 
    levels: [
      { coord: [0.2, 37], name: 'L5' }, 
      { coord: [1.4, 47], name: 'L6' }, 
      { coord: [3.4, 69], name: 'L7' }, 
      { coord: [4.3, 122], name: 'L8' }
    ]
  },
  '小米': {
    color: '#f43f5e', 
    gradColor: ['#ffe4e6', '#f43f5e'],
    labelPos: 'right',
    levels: [
      { coord: [0.5, 29], name: '13级' }, 
      { coord: [2.0, 59], name: '15级' }, 
      { coord: [2.5, 94], name: '17级' }
    ]
  },
  '百度': {
    color: '#ec4899', 
    gradColor: ['#fce7f3', '#ec4899'],
    labelPos: 'right',
    levels: [
      { coord: [2.0, 58], name: 'P5' }, 
      { coord: [3.5, 60], name: 'T5' }, 
      { coord: [4.5, 164], name: 'T7' }
    ]
  },
  '京东': {
    color: '#14b8a6', 
    gradColor: ['#ccfbf1', '#14b8a6'],
    labelPos: 'left',
    levels: [
      { coord: [3.0, 42], name: 'T4' }, 
      { coord: [3.5, 65], name: 'T5' }, 
      { coord: [4.0, 67], name: 'T6' }, 
      { coord: [4.8, 142], name: 'T8' }
    ]
  },
  '网易': {
    color: '#8b5cf6', 
    gradColor: ['#ede9fe', '#8b5cf6'],
    labelPos: 'top',
    levels: [
      { coord: [0.0, 27], name: '3-1' }, 
      { coord: [4.0, 35], name: '3-2' }, 
      { coord: [4.1, 49], name: '3-3' }, 
      { coord: [5.3, 56], name: '4-1' }, 
      { coord: [10.5, 140], name: '5-1' }
    ]
  }
}

// ---------------------------------------------------------
// 2. 交互逻辑
// ---------------------------------------------------------

function toggleCompany(company) {
  const index = selectedCompanies.value.indexOf(company)
  if (index > -1) {
    if (selectedCompanies.value.length > 1) {
      selectedCompanies.value.splice(index, 1)
    }
  } else {
    selectedCompanies.value.push(company)
  }
}

function getCompanyColor(name) {
  return careerPaths[name]?.color || '#999'
}

function getChipStyle(name) {
  const isSelected = selectedCompanies.value.includes(name)
  const color = getCompanyColor(name)
  if (isSelected) {
    return {
      borderColor: color,
      backgroundColor: hexToRgba(color, 0.05),
      color: '#1f2937',
      fontWeight: '600'
    }
  }
  return {}
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ---------------------------------------------------------
// 3. 图表配置
// ---------------------------------------------------------
const chartOption = computed(() => {
  const series = []
  
  const count = selectedCompanies.value.length
  // 动态间距：公司越多，错位越小，避免太散
  const spacing = count > 5 ? 0.15 : 0.25 
  const center = (count - 1) / 2
  
  selectedCompanies.value.forEach((company) => {
    const data = careerPaths[company]
    const offsetX = 0
    
    const lineCoords = data.levels.map(l => [l.coord[0] + offsetX, l.coord[1]])
    
    // 1. 光影折线
    series.push({
      name: company,
      type: 'line',
      data: lineCoords,
      smooth: 0.45, 
      symbol: 'none', 
      lineStyle: { 
        width: 3, 
        color: data.color,
        shadowColor: hexToRgba(data.color, 0.5), 
        shadowBlur: 10,
        shadowOffsetY: 6
      },
      areaStyle: {
        opacity: 0.15,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: data.color },
          { offset: 1, color: 'rgba(255,255,255,0)' } 
        ])
      },
      z: 2
    })

    // 2. 宝石节点
    series.push({
      name: company,
      type: 'scatter',
      data: data.levels.map(l => ({ 
        value: [l.coord[0] + offsetX, l.coord[1]], 
        name: l.name,
        realYear: l.coord[0]
      })),
      symbolSize: 12,
      itemStyle: {
        color: '#fff', 
        borderColor: data.color,
        borderWidth: 2.5,
        shadowColor: hexToRgba(data.color, 0.4),
        shadowBlur: 5,
        shadowOffsetY: 2
      },
      label: {
        show: true,
        formatter: (p) => p.data.name, 
        fontSize: 10,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#374151',
        fontWeight: 700,
        position: 'top', 
        distance: 5,
        backgroundColor: 'rgba(255,255,255,0.85)', 
        padding: [2, 4],
        borderRadius: 4,
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowBlur: 2,
        shadowOffsetY: 1
      },
      labelLayout: {
        hideOverlap: true,
        moveOverlap: 'shiftY'
      },
      z: 10
    })
  })

  return {
    backgroundColor: '#ffffff',
    tooltip: {
      show: true,
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: [12, 16],
      textStyle: { color: '#1f2937', fontSize: 13 },
      borderColor: '#e5e7eb',
      borderWidth: 1,
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      formatter: (params) => {
        if (params.componentType === 'series') {
           const isScatter = params.seriesType === 'scatter'
           const name = isScatter ? params.data.name : ''
           const year = Math.abs(params.data.realYear || params.value[0]).toFixed(1)
           const salary = params.value[1]
           
           return `
             <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
               <span style="width:10px; height:10px; border-radius:50%; background:${params.color};"></span>
               <span style="font-weight:700; color:#111827;">${params.seriesName} ${name}</span>
             </div>
             <div style="color:#6b7280; font-size:12px;">
               工龄：<span style="font-weight:600; color:#111827">${year} 年</span><br/>
               年薪：<span style="font-weight:600; color:#111827">${salary} 万</span>
             </div>
           `
        }
      }
    },
    legend: { show: false },
    grid: {
      left: '2%', 
      right: '5%',
      bottom: '5%', // 恢复正常底部边距
      top: '12%', 
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '工作年限 (年)',
      nameTextStyle: { color: '#9ca3af', padding: [0, 0, 0, 10] },
      min: 0,    // 核心修改：锁定起点为 0，防止视线漂移
      max: 14.5, // 锁定终点
      splitLine: { 
        show: true, 
        lineStyle: { type: 'dashed', color: '#f3f4f6', width: 1 } 
      },
      axisLine: { show: false }, 
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', margin: 16 }
    },
    yAxis: {
      type: 'log', 
      name: '年总包 (万)',
      nameTextStyle: { color: '#9ca3af', align: 'right', padding: [0, 10, 0, 0] },
      min: 10,     
      max: 500,    
      logBase: 50, 
      splitLine: { 
        show: true, 
        lineStyle: { type: 'dashed', color: '#f3f4f6', width: 1 } 
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        show: true,
        color: '#9ca3af',
        margin: 12,
        formatter: (val) => {
          if ([10, 20, 30, 50, 80, 100, 150, 200, 300, 400, 500].includes(val)) {
            return val;
          }
          return '';
        }
      } 
    },
    series: series
  }
})
</script>

<style scoped>
/* 样式保持不变，沿用上一版优秀的 UI 设计 */
.salary-edu-exp-chart {
  display: flex;
  flex-direction: column;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
}

.header-top {
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

.tag {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: #fff;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
}

.control-panel {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 20px;
}

.panel-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 600;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.company-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.company-chip:hover {
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.company-chip.active {
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
}

.indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #cbd5e1;
  transition: all 0.3s ease;
}

.check-mark {
  color: #fff;
  font-size: 10px;
  font-weight: 900;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.tip-icon { font-size: 16px; margin-right: 6px; }

.chart-wrapper {
  margin-top: 30px;
  width: 100%;
}

.chart {
  width: 100%;
  height: 600px;
}

@media (max-width: 640px) {
  .chart {
    height: 450px;
  }
}
</style>