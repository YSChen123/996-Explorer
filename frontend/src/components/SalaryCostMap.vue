<template>
  <div class="china-map-wrapper">
    <aside class="company-panel">
      <div class="company-panel-title">
        <span>💰 薪资性价比地图</span>
        <span class="sub-title">圆越大 = 搞钱剩越多</span>
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
              <span class="salary-tag">~{{ c.salary }}k</span>
            </div>
            <div class="company-extra">分布: {{ getCityCount(c.key) }} 城</div>
          </div>
        </button>
      </div>
    </aside>

    <div class="map-panel">
      <v-chart class="map-chart" :option="mapOption" autoresize />
      <div class="map-legend">
        <div class="legend-row">
          <span class="dot size-dot"></span> 
          <span>圆圈大小 = 每月盈余 (月薪-成本)</span>
        </div>
        <div class="legend-row">
          <span class="dot color-dot"></span>
          <span>颜色红度 = 生活成本 (越红越贵)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
// 确保引入了 china.json
import chinaJson from '../assets/china.json' 

// ===== 注册地图 =====
// 避免重复注册
if (!echarts.getMap('china')) {
  echarts.registerMap('china', chinaJson)
}

// ===== 1. 基础数据 =====

// 城市生活成本 (k/月)
const cityCostMap = {
  '上海': 14.5, '北京': 13.5, '深圳': 12.0, '杭州': 9.5,
  '广州': 9.0, '南京': 7.0, '成都': 6.5, '武汉': 6.0, '西安': 5.5
}

// 城市经纬度
const cityCoordMap = {
  '北京': [116.40, 39.90], '上海': [121.47, 31.23], '广州': [113.27, 23.13],
  '深圳': [114.06, 22.55], '杭州': [120.16, 30.25], '南京': [118.78, 32.04],
  '成都': [104.06, 30.67], '西安': [108.94, 34.34], '武汉': [114.31, 30.52]
}

// 公司数据
const companies = [
  { key: 'pdd', nameZh: '拼多多', badge: '多', color: '#ef4444', salary: 60 },
  { key: 'bytedance', nameZh: '字节跳动', badge: '字', color: '#06b6d4', salary: 55 },
  { key: 'tencent', nameZh: '腾讯', badge: '腾', color: '#2563eb', salary: 50 },
  { key: 'huawei', nameZh: '华为', badge: '菊', color: '#c7000b', salary: 48 },
  { key: 'kuaishou', nameZh: '快手', badge: '快', color: '#f97316', salary: 46 },
  { key: 'alibaba', nameZh: '阿里巴巴', badge: '阿', color: '#ff6a00', salary: 45 },
  { key: 'meituan', nameZh: '美团', badge: '团', color: '#ffc300', salary: 42 },
  { key: 'baidu', nameZh: '百度', badge: '度', color: '#2932e1', salary: 40 },
  { key: 'netease', nameZh: '网易', badge: '网', color: '#c20c0c', salary: 38 },
  { key: 'xiaomi', nameZh: '小米', badge: '米', color: '#ff6700', salary: 36 },
  { key: 'jd', nameZh: '京东', badge: '京', color: '#e1251b', salary: 35 }
]

// 分布数据
const companyCityMap = {
  tencent: ['北京', '上海', '广州', '深圳', '成都', '武汉', '西安'],
  bytedance: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉'],
  alibaba: ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都'],
  pdd: ['上海'],
  huawei: ['北京', '上海', '深圳', '杭州', '南京', '武汉', '西安', '成都'],
  kuaishou: ['北京', '深圳', '杭州'],
  meituan: ['北京', '上海', '成都', '深圳'],
  baidu: ['北京', '上海', '深圳'],
  netease: ['北京', '上海', '广州', '杭州'],
  xiaomi: ['北京', '武汉', '南京'],
  jd: ['北京', '上海', '成都', '武汉']
}

// ===== 2. 状态 =====
const activeCompanyKey = ref('tencent')

const currentCompany = computed(() => 
  companies.find(c => c.key === activeCompanyKey.value) || companies[0]
)

const getCityCount = (key) => companyCityMap[key]?.length || 0

// ===== 3. Option 计算 =====
const mapOption = computed(() => {
  const company = currentCompany.value
  const cityNames = companyCityMap[company.key] || []
  
  // 构造散点数据
  const scatterData = cityNames
    .filter(name => cityCoordMap[name])
    .map(name => {
      const cost = cityCostMap[name] || 8.0 
      const surplus = company.salary - cost 
      return {
        name,
        value: [...cityCoordMap[name], surplus, cost, company.salary] 
      }
    })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: company.color,
      borderWidth: 1,
      padding: 12,
      textStyle: { color: '#333' },
      formatter: params => {
        if (params.seriesType === 'scatter' || params.seriesType === 'effectScatter') {
          const [lng, lat, surplus, cost, salary] = params.value
          return `
            <div style="font-weight:bold; font-size:15px; margin-bottom:4px;">
              ${company.nameZh} · ${params.name}
            </div>
            <div style="font-size:12px; color:#666; line-height:1.8;">
              <div>💰 平均月薪：<span style="color:${company.color};font-weight:bold">${salary}k</span></div>
              <div>📉 生活成本：<span style="color:#ef4444">-${cost}k</span></div>
              <div style="border-top:1px solid #eee; margin-top:4px; padding-top:4px;">
                🎉 每月盈余：<span style="color:#eab308;font-weight:bold;font-size:14px">${surplus.toFixed(1)}k</span>
              </div>
            </div>
          `
        }
        return params.name
      }
    },
    visualMap: {
      show: false, 
      dimension: 3, // 使用 value[3] (cost) 映射颜色
      min: 5,
      max: 15,
      inRange: {
        color: ['#10b981', '#facc15', '#ef4444'] 
      }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.25,
      center: [106, 36],
      label: { show: false },
      itemStyle: {
        areaColor: '#f8fafc', 
        borderColor: '#94a3b8',
        borderWidth: 1,
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowBlur: 5
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e2e8f0'
        }
      }
    },
    series: [
      // 特效涟漪：高盈余城市(>35k)
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: { brushType: 'stroke', scale: 3 },
        symbolSize: val => Math.max(8, (val[2] - 15) * 1.3),
        itemStyle: {
          color: company.color,
          opacity: 0.8
        },
        data: scatterData.filter(d => d.value[2] > 35)
      },
      // 实体散点：所有城市
      {
        name: '性价比',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        symbolSize: val => Math.max(10, (val[2] - 18) * 1.3),
        label: {
          show: true,
          position: 'bottom',
          formatter: '{b}',
          color: '#333',
          fontSize: 11,
          backgroundColor: 'rgba(255,255,255,0.7)',
          padding: [2,4],
          borderRadius: 3
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.3)'
        },
        data: scatterData
      }
    ]
  }
})
</script>

<style scoped>
/* 样式保持和 ChinaMap.vue 一致，保证风格统一 */
.china-map-wrapper {
  display: flex;
  gap: 16px;
  height: 640px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  box-sizing: border-box;
}

.company-panel {
  width: 260px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f1f5f9;
  padding-right: 12px;
}

.company-panel-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}
.sub-title {
  font-size: 11px;
  color: #94a3b8;
  font-weight: normal;
  margin-top: 4px;
}

.company-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.company-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  background: #f8fafc;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.company-item:hover { background: #f1f5f9; transform: translateX(2px); }
.company-item.active {
  background: #eff6ff;
  border-color: var(--company-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.company-logo {
  width: 32px; height: 32px;
  border-radius: 6px;
  background: #fff;
  color: var(--company-color);
  font-weight: bold;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid #e2e8f0;
  margin-right: 10px; flex-shrink: 0;
}
.company-item.active .company-logo {
  background: var(--company-color); color: #fff; border-color: var(--company-color);
}

.company-text { flex: 1; text-align: left; }
.company-header { display: flex; justify-content: space-between; align-items: center; }
.company-name-zh { font-size: 14px; font-weight: 600; color: #334155; }
.salary-tag { font-size: 12px; color: #059669; background: #d1fae5; padding: 1px 4px; border-radius: 4px; }
.company-extra { font-size: 11px; color: #94a3b8; margin-top: 2px; }

.map-panel { flex: 1; position: relative; background: #fcfcfc; border-radius: 8px; overflow: hidden; }
.map-chart { width: 100%; height: 100%; }

.map-legend {
  position: absolute; bottom: 20px; right: 20px;
  background: rgba(255,255,255,0.9); padding: 10px;
  border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-size: 12px; color: #64748b; border: 1px solid #e2e8f0;
}
.legend-row { display: flex; align-items: center; margin-bottom: 6px; }
.legend-row:last-child { margin-bottom: 0; }
.dot { display: inline-block; margin-right: 8px; }
.size-dot { width: 12px; height: 12px; background: #94a3b8; border-radius: 50%; }
.color-dot { width: 50px; height: 8px; background: linear-gradient(to right, #10b981, #facc15, #ef4444); border-radius: 4px; }
</style>