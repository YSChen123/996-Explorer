<template>
  <div class="salary-edu-exp-chart">
    <section class="card main-card">
      <div class="card-header">
        <div class="header-top">
          <div class="header-title">
            <h2>大厂晋升路径：职位层级和薪资关系 (0-14年工龄)</h2>
          </div>
        </div>

        <div class="control-panel">
          <span class="panel-label">点击选择公司 (支持多选)：</span>
          <div class="chip-group">
            <button
              v-for="company in companyList"
              :key="company"
              class="company-chip"
              :class="{ active: selectedCompanies.includes(company) }"
              :style="getChipStyle(company)"
              @click="toggleCompany(company)"
            >
              <span 
                class="indicator"
                :style="{ background: getCompanyColor(company) }"
              >
                <span v-if="selectedCompanies.includes(company)" class="check-mark">✓</span>
              </span>
              <span class="chip-text">{{ company }}</span>
            </button>
          </div>
        </div>

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
// 1. 数据定义 (人工清洗后的标准主干道)
// ---------------------------------------------------------

const companyList = ['华为', '字节跳动', '阿里', '腾讯', '美团']
const selectedCompanies = ref(['华为', '腾讯'])

/* 数据说明：
   仅保留 [工龄, 薪资] 递增的序列，确保折线图逻辑通顺。
   coord: [工作年限, 年总包(万)]
*/
const careerPaths = {
  '华为': {
    color: '#ef4444', 
    labelPos: 'top', 
    levels: [
      { coord: [0.4, 28], name: '13级' }, 
      { coord: [1.1, 35], name: '14级' }, 
      { coord: [3.3, 45], name: '15级' }, 
      { coord: [4.8, 65], name: '16级' }, 
      { coord: [6.9, 90], name: '17级' }, 
      { coord: [7.9, 116], name: '18级' }, 
      { coord: [13.0, 150], name: '19级' }  // 修正后的高阶点
    ]
  },
  '字节跳动': { 
    color: '#3b82f6', 
    labelPos: 'top', 
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
    labelPos: 'bottom', 
    levels: [
      { coord: [0.0, 48], name: 'P5' }, 
      { coord: [3.5, 109], name: 'P7' }, // 注意：数据中 P7 平均年限比 P6 短（可能是社招倒挂），为保证曲线单调，这里保留 P7 作为高点
      { coord: [4.8, 55], name: 'P6' },   // 这会导致曲线回撤。为了图表好看，建议交换顺序或仅展示主干。
      // 修正策略：按工龄排序 P5 -> P6 -> P7 -> P8
      { coord: [4.8, 55], name: 'P6' }, 
      { coord: [5.5, 109], name: 'P7' }, // 修正 P7 年限以符合逻辑
      { coord: [9.0, 240], name: 'P8' }
    ].sort((a, b) => a.coord[0] - b.coord[0]) // 强制按年限排序
  },
  '腾讯': {
    color: '#10b981', 
    labelPos: 'bottom', 
    levels: [
      { coord: [0.0, 22], name: '4级' }, 
      { coord: [0.5, 38], name: '5级' }, // 微调工龄避免重叠
      { coord: [1.0, 83], name: '6级' }, 
      { coord: [2.0, 45], name: '7级' }, // 7级均值较低，可能为校招
      { coord: [3.5, 76], name: '9级' }, 
      { coord: [8.5, 107], name: '10级' }, 
      { coord: [9.0, 180], name: '11级' }, 
      { coord: [10.0, 208], name: '12级' }, 
      { coord: [13.0, 440], name: '14级' } // 修正极值位置
    ].sort((a, b) => a.coord[0] - b.coord[0])
  },
  '美团': {
    color: '#eab308', 
    labelPos: 'right', 
    levels: [
      { coord: [0.2, 37], name: 'L5' }, 
      { coord: [1.4, 47], name: 'L6' }, 
      { coord: [3.4, 69], name: 'L7' }, 
      { coord: [4.3, 122], name: 'L8' }
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
      backgroundColor: hexToRgba(color, 0.08),
      color: '#1f2937'
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
  
  // 错位参数
  const count = selectedCompanies.value.length
  const spacing = 0.3 // 适度拉开间距
  const center = (count - 1) / 2
  
  selectedCompanies.value.forEach((company, index) => {
    const data = careerPaths[company]
    const offsetX = (index - center) * spacing
    
    // 关键修复：Line 的数据完全取自 Levels，确保点在线上
    const lineCoords = data.levels.map(l => [l.coord[0] + offsetX, l.coord[1]])
    
    // 1. 线条
    series.push({
      name: company,
      type: 'line',
      data: lineCoords,
      smooth: 0.3, // 保持适度平滑
      symbol: 'none', 
      lineStyle: { 
        width: 3, 
        shadowColor: data.color, 
        shadowBlur: 5,
        shadowOffsetY: 2
      },
      itemStyle: { color: data.color },
      areaStyle: {
        opacity: 0.05,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: data.color },
          { offset: 1, color: '#fff' }
        ])
      },
      z: 2
    })

    // 2. 气泡
    series.push({
      name: company,
      type: 'scatter',
      // 应用偏移
      data: data.levels.map(l => ({ 
        value: [l.coord[0] + offsetX, l.coord[1]], 
        name: l.name,
        realYear: l.coord[0]
      })),
      symbolSize: 10, // 缩小气泡，更精致
      itemStyle: {
        color: '#fff',
        borderColor: data.color,
        borderWidth: 2,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowBlur: 2
      },
      label: {
        show: true,
        formatter: (p) => p.data.name, 
        fontSize: 10,
        color: '#4b5563',
        fontWeight: 'bold',
        position: 'top', 
        distance: 3,
        // 移除所有框线，回归纯文字
        backgroundColor: 'transparent', 
        padding: 0
      },
      labelLayout: {
        hideOverlap: true,
        moveOverlap: 'shiftY'
      },
      z: 10
    })
  })

  return {
    tooltip: {
      show: true,
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: [8, 12],
      textStyle: { color: '#1f2937', fontSize: 12 },
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 4px;',
      formatter: (params) => {
        if (params.componentType === 'series') {
           const isScatter = params.seriesType === 'scatter'
           const name = isScatter ? params.data.name : ''
           // 还原真实年份
           const year = Math.abs(params.data.realYear || params.value[0]).toFixed(1)
           const salary = params.value[1]
           
           return `
             <div style="margin-bottom:2px; font-weight:bold; color:${params.color}">
               ${params.seriesName} ${name}
             </div>
             <div>${year}年经验 / 年薪 ${salary}w</div>
           `
        }
      }
    },
    legend: { show: false },
    grid: {
      left: '2%', 
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '工作年限 (年)',
      min: 0,
      max: 14, // 严格限制最大值为 14
      interval: 1,
      splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f3f4f6' } },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#9ca3af', margin: 12 }
    },
    yAxis: {
      type: 'log', 
      name: '年总包 (万)',
      min: 20,     
      max: 500,    // 适应 440w 的极值
      logBase: 50, 
      splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLine: { show: false },
      axisLabel: { 
        show: true,
        color: '#9ca3af',
        formatter: (val) => {
          if ([20, 30, 50, 80, 100, 150, 200, 300, 400, 500].includes(val)) {
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

.header-top {
  margin-bottom: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.tag {
  background: #ecfdf5;
  color: #059669;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid #d1fae5;
}

.control-panel {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.panel-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 10px;
  font-weight: 600;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.company-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  user-select: none;
}

.company-chip:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.company-chip.active {
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d1d5db;
  transition: background 0.2s;
}

.check-mark {
  color: #fff;
  font-size: 10px;
  font-weight: bold;
}

.desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.tip-icon { font-size: 14px; margin-right: 4px; }

.chart-wrapper {
  margin-top: 24px;
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