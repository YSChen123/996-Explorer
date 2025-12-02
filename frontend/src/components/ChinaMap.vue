<template>
  <div class="china-map-wrapper">
    <aside class="company-panel">
      <div class="company-panel-title">⭐ 选择一家公司</div>
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
            <div class="company-name-zh">{{ c.nameZh }}</div>
            <div class="company-name-en">{{ c.nameEn }}</div>
            <div class="company-extra">总部：{{ c.hq }}</div>
          </div>
        </button>
      </div>
    </aside>

    <div class="map-panel">
      <v-chart class="map-chart" :option="mapOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
// 假设 chinaJson 路径正确
import chinaJson from '../assets/china.json' 

// ===== 防止多次注册 china 地图：用模块级变量，不用 TS 语法 =====
let chinaRegistered = false
if (!chinaRegistered) {
  echarts.registerMap('china', chinaJson)
  chinaRegistered = true
}

// 9 家公司配置（logo 先留空占位）
const companies = [
  {
    key: 'tencent',
    nameZh: '腾讯',
    nameEn: 'Tencent',
    badge: '腾',
    color: '#2563eb', // 蓝色系
    hq: '深圳',
    logo: ''
  },
  {
    key: 'bytedance',
    nameZh: '字节跳动',
    nameEn: 'ByteDance',
    badge: '字',
    color: '#06b6d4', // 青色系
    hq: '北京',
    logo: ''
  },
  {
    key: 'alibaba',
    nameZh: '阿里巴巴',
    nameEn: 'Alibaba',
    badge: '阿',
    color: '#f97316', // 橙色系
    hq: '杭州',
    logo: ''
  },
  {
    key: 'pdd',
    nameZh: '拼多多',
    nameEn: 'PDD',
    badge: '多',
    color: '#ef4444', // 红色系
    hq: '上海',
    logo: ''
  },
  {
    key: 'xiaomi',
    nameZh: '小米',
    nameEn: 'Xiaomi',
    badge: '米',
    color: '#fb923c', // 浅橙色系
    hq: '北京',
    logo: ''
  },
  {
    key: 'netease',
    nameZh: '网易',
    nameEn: 'NetEase',
    badge: '网',
    color: '#dc2626', // 深红色系
    hq: '杭州',
    logo: ''
  },
  {
    key: 'meituan',
    nameZh: '美团',
    nameEn: 'Meituan',
    badge: '团',
    color: '#22c55e', // 绿色系
    hq: '北京',
    logo: ''
  },
  {
    key: 'jd',
    nameZh: '京东',
    nameEn: 'JD.com',
    badge: '京',
    color: '#f97373', // 粉红色系
    hq: '北京',
    logo: ''
  },
  {
    key: 'baidu',
    nameZh: '百度',
    nameEn: 'Baidu',
    badge: '度',
    color: '#3b82f6', // 亮蓝色系
    hq: '北京',
    logo: ''
  }
]

// 城市坐标（经纬度）
const cityCoordMap = {
  北京: [116.40, 39.90],
  上海: [121.47, 31.23],
  广州: [113.27, 23.13],
  深圳: [114.06, 22.55],
  杭州: [120.16, 30.25],
  南京: [118.78, 32.04],
  成都: [104.06, 30.67],
  西安: [108.94, 34.34]
}

// 每家公司对应的城市
const companyCityMap = {
  tencent: ['北京', '上海', '广州', '深圳', '成都', '西安'],
  bytedance: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都'],
  alibaba: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '西安'],
  pdd: ['上海'],
  xiaomi: ['北京', '南京', '西安'],
  netease: ['北京', '上海', '广州', '杭州'],
  meituan: ['北京', '上海', '成都'],
  jd: ['北京', '上海', '广州', '深圳', '南京', '成都', '西安'],
  baidu: ['北京', '上海', '深圳', '成都']
}

const activeCompanyKey = ref('tencent')

const currentCompany = computed(() =>
  companies.find(c => c.key === activeCompanyKey.value) || companies[0]
)

const currentCities = computed(() => companyCityMap[activeCompanyKey.value] || [])

// 地图配置 (ECharts Option) - 优化后
const mapOption = computed(() => {
  const company = currentCompany.value
  const cities = currentCities.value
  const hqCity = company.hq
  const hqCoord = cityCoordMap[hqCity]

  const scatterData = cities
    .filter(name => cityCoordMap[name])
    .map(name => ({
      name,
      value: [...cityCoordMap[name], name === hqCity ? 2 : 1] // 用 2 标记总部
    }))

  // 连线数据：从总部 -> 各分部
  const linesData = cities
    .filter(name => name !== hqCity && cityCoordMap[name] && hqCoord)
    .map(name => ({
      name: name, // 为连线也设置名称，方便 tooltip
      coords: [hqCoord, cityCoordMap[name]],
      // 在 data 级别设置弧度，让多条线不会完全重合，而是略微分开
      lineStyle: {
        curveness: 0.25 + Math.random() * 0.1 // 随机化弧度 0.25 - 0.35
      }
    }))

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#d1d5db',
      borderWidth: 1,
      textStyle: {
        color: '#1f2937'
      },
      formatter: params => {
        if (params.seriesType === 'effectScatter') {
          return `${company.nameZh} · **${params.name}**`
        }
        if (params.seriesType === 'lines' && params.seriesName.includes('流光')) {
          // 连线的 tooltip 提示从总部流向分部
          return `${company.nameZh}: **${hqCity}** 连至 **${params.name}**`
        }
        return params.name
      }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.6, // 放大地图，聚焦核心区域
      center: [108, 35], // 中心点略微北移东移，聚焦中东部
      label: {
        show: false
      },
      itemStyle: {
        areaColor: '#eef1f4',
        borderColor: '#bbbec2',
        borderWidth: 1.2,
        shadowColor: 'rgba(0,0,0,0.15)', // 增加阴影深度
        shadowBlur: 15,
        shadowOffsetX: 3,
        shadowOffsetY: 5
      },
      emphasis: {
        itemStyle: {
          areaColor: '#d3e2ee',
          borderColor: '#94a3b8'
        }
      }
    },
    series: [
      // 1. 粗连线底图（作为流线的背景光晕）
      {
        name: `${company.nameZh} · 连线底图`,
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1, // 确保在底部
        silent: true, // 不触发鼠标事件
        lineStyle: {
          color: company.color,
          width: 4, // 较粗
          opacity: 0.3, // 透明度较低
          curveness: 0.3,
        },
        data: linesData.map(d => ({ 
            ...d, 
            lineStyle: { ...d.lineStyle, width: 4, opacity: 0.3, curveness: d.lineStyle.curveness } 
        }))
      },
      // 2. 发光连线（具有流光效果的前景线）
      {
        name: `${company.nameZh} · 流光连线`,
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 3, // 确保在粗底图之上
        effect: {
          show: true,
          period: 4,
          trailLength: 0.6,
          symbol: 'pin',
          symbolSize: 10,
          color: company.color,
        },
        lineStyle: {
          color: company.color,
          width: 1, // 较细，突出流光
          opacity: 0.9,
          curveness: 0.3,
          shadowColor: company.color,
          shadowBlur: 10
        },
        data: linesData.map(d => ({ 
            ...d, 
            lineStyle: { ...d.lineStyle, width: 1, shadowBlur: 10, curveness: d.lineStyle.curveness } 
        }))
      },
      // 3. 城市高亮点
      {
        name: `${company.nameZh} · 办公城市`,
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 4, 
        rippleEffect: {
          brushType: 'fill',
          scale: 7, 
          period: 3
        },
        // 总部使用星形符号，更突出
        symbol: (val) => (val[2] === 2 ? 'star' : 'circle'), 
        symbolSize: (val) => (val[2] === 2 ? 22 : 14), // 总部点更大
        itemStyle: {
          color: company.color,
          shadowBlur: 30,
          shadowColor: company.color,
          opacity: 0.9
        },
        label: {
          show: true,
          formatter: (params) => {
             // 总部标签加个【总】字
             return params.value[2] === 2 ? `{a|总}{b|${params.name}}` : params.name;
          },
          position: 'right',
          color: '#111827',
          fontSize: 12,
          fontWeight: 700,
          backgroundColor: 'rgba(255,255,255,0.98)',
          padding: [4, 8],
          borderRadius: 6,
          borderColor: 'rgba(55,65,81,0.2)',
          borderWidth: 1,
          rich: {
             a: {
                backgroundColor: company.color,
                color: '#ffffff',
                fontSize: 10,
                padding: [2, 4],
                borderRadius: 4,
                margin: [0, 4, 0, 0],
                fontWeight: 'normal'
             },
             b: {
                color: '#111827'
             }
          }
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
  margin-top: 15px;
}

/* 左侧公司选择 - 整体美化 */
.company-panel {
  width: 260px; 
  /* 使用一个轻微的渐变背景 */
  background: linear-gradient(145deg, #ffffff, #f7f7f9); 
  border-radius: 16px; 
  padding: 16px; 
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.company-panel-title {
  font-size: 14px; 
  font-weight: 700; 
  color: #1f2937;
  margin-bottom: 12px;
  /* 增加一个底部边框作为分隔线 */
  padding-bottom: 8px;
  border-bottom: 1px solid #eeeeee;
}

.company-list {
  display: flex;
  flex-direction: column;
  gap: 8px; 
  overflow-y: auto;
  max-height: 500px; /* 匹配新的地图高度 */
  padding-right: 4px;
}

/* 滚动条美化（Webkit 浏览器） */
.company-list::-webkit-scrollbar {
  width: 6px;
}
.company-list::-webkit-scrollbar-thumb {
  background: #cccccc;
  border-radius: 3px;
}

/* 公司选择项 - 交互美化 */
.company-item {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid transparent; 
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 12px; 
  background: #ffffff;
  text-align: left;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.company-item:hover {
  background: #f0f4f8;
  border-color: #d1d5db;
  transform: translateY(-2px); 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

/* 重点：使用公司品牌色美化选中状态 */
.company-item.active {
  background: var(--company-color);
  border: 1px solid var(--company-color);
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
  position: relative;
  z-index: 10;
}

.company-item.active .company-name-zh {
  color: #ffffff; 
}
.company-item.active .company-name-en,
.company-item.active .company-extra {
  color: #e5e7eb;
}

.company-logo {
  width: 36px; 
  height: 36px;
  border-radius: 50%;
  /* 基础状态美化 */
  background: #f3f4f6;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  margin-right: 12px;
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05) inset;
  transition: all 0.2s ease;
}

/* 重点：选中时 logo 变成公司色反色 */
.company-item.active .company-logo {
  background: #ffffff; 
  color: var(--company-color); 
  border-color: #ffffff;
}

.company-name-zh {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.company-name-en {
  font-size: 12px;
  color: #6b7280;
}
.company-extra {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280; 
  margin-top: 2px;
}

/* 右侧地图面板 */
.map-panel {
  flex: 1;
  min-width: 0;
  background: #f9fafb; 
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
  padding: 12px; 
  box-sizing: border-box;
}

.map-chart {
  width: 100%;
  height: 500px; /* 增加地图高度，以适应放大后的视图 */
}

/* 响应式调整 */
@media (max-width: 900px) {
  .china-map-wrapper {
    flex-direction: column;
    gap: 12px;
  }
  .company-panel {
    width: 100%;
    flex-direction: column;
    padding: 12px;
    max-height: none;
    border-radius: 12px;
  }
  .company-list {
    flex-direction: row;
    flex-wrap: nowrap; 
    overflow-x: auto; 
    padding-bottom: 6px;
    -ms-overflow-style: none; 
    scrollbar-width: none; 
  }
  .company-list::-webkit-scrollbar {
    display: none; 
  }
  .company-item {
    flex-shrink: 0; 
    width: auto;
  }
  .company-text {
    display: none; 
  }
  .company-item.active {
    padding-right: 12px; 
  }
  .company-item.active .company-text {
     display: flex;
     flex-direction: column;
     gap: 1px;
     align-items: flex-start;
  }
  .company-logo {
     margin-right: 8px;
  }
  .map-panel {
     padding: 8px;
  }
  .map-chart {
    height: 360px;
  }
}
</style>