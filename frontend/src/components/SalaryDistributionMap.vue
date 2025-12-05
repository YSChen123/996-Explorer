<template>
  <div class="china-map-wrapper">
    <aside class="company-panel">
      <div class="company-panel-title">
        <span>💸 大厂薪资分布</span>
        <span class="sub-title">圆越大 = 薪资越高 (税前月薪)</span>
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
            <div class="company-extra">
              {{ c.hq }}总部 · 分布 {{ getCityCount(c.key) }} 城
            </div>
          </div>
        </button>
      </div>
    </aside>

    <div class="map-panel">
      <v-chart class="map-chart" :option="mapOption" autoresize />
      <div class="map-legend">
        <div class="legend-row">
          <span class="dot size-dot"></span> 
          <span>圆圈大小 = 平均月薪 (k)</span>
        </div>
        <div class="legend-row">
          <span class="dot color-dot"></span>
          <span>颜色 = 公司品牌色</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
// 引用地图数据
import chinaJson from '../assets/china.json' 

// 注册地图
if (!echarts.getMap('china')) {
  echarts.registerMap('china', chinaJson)
}

// ===== 基础数据 =====

// 城市经纬度
const cityCoordMap = {
  '北京': [116.40, 39.90], '上海': [121.47, 31.23], '广州': [113.27, 23.13],
  '深圳': [114.06, 22.55], '杭州': [120.16, 30.25], '南京': [118.78, 32.04],
  '成都': [104.06, 30.67], '西安': [108.94, 34.34], '武汉': [114.31, 30.52]
}

// 公司数据 (薪资为预估中位数)
const companies = [
  { key: 'pdd', nameZh: '拼多多', badge: '多', color: '#ef4444', hq: '上海', salary: 60 },
  { key: 'bytedance', nameZh: '字节跳动', badge: '字', color: '#06b6d4', hq: '北京', salary: 55 },
  { key: 'tencent', nameZh: '腾讯', badge: '腾', color: '#2563eb', hq: '深圳', salary: 50 },
  { key: 'huawei', nameZh: '华为', badge: '菊', color: '#c7000b', hq: '深圳', salary: 48 },
  { key: 'kuaishou', nameZh: '快手', badge: '快', color: '#f97316', hq: '北京', salary: 46 },
  { key: 'alibaba', nameZh: '阿里巴巴', badge: '阿', color: '#ff6a00', hq: '杭州', salary: 45 },
  { key: 'meituan', nameZh: '美团', badge: '团', color: '#ffc300', hq: '北京', salary: 42 },
  { key: 'baidu', nameZh: '百度', badge: '度', color: '#2932e1', hq: '北京', salary: 40 },
  { key: 'netease', nameZh: '网易', badge: '网', color: '#c20c0c', hq: '杭州', salary: 38 },
  { key: 'xiaomi', nameZh: '小米', badge: '米', color: '#ff6700', hq: '北京', salary: 36 },
  { key: 'jd', nameZh: '京东', badge: '京', color: '#e1251b', hq: '北京', salary: 35 }
]

// 城市分布 (Mock Data)
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

// ===== 状态逻辑 =====
const activeCompanyKey = ref('pdd') // 默认选个工资高的

const currentCompany = computed(() => 
  companies.find(c => c.key === activeCompanyKey.value) || companies[0]
)

const getCityCount = (key) => companyCityMap[key]?.length || 0

// ===== Option 计算 =====
const mapOption = computed(() => {
  const company = currentCompany.value
  const cityNames = companyCityMap[company.key] || []
  
  // 1. 构造数据
  const scatterData = cityNames
    .filter(name => cityCoordMap[name])
    .map(name => {
      // 为了让地图有点“分布感”，我们给一线/非一线城市加个微小的薪资系数
      // 真实情况：总部/一线城市薪资通常是满额，二线城市可能有 0.8-0.9 的系数
      // 这里做个简单模拟，让圆圈大小微弱变化，不至于全一样
      let ratio = 1.0
      if (['成都', '武汉', '西安', '南京'].includes(name)) ratio = 0.85
      
      const localSalary = company.salary * ratio
      
      return {
        name,
        // value 格式：[经度, 纬度, 当地薪资, 总部薪资(用于展示)]
        value: [...cityCoordMap[name], localSalary, company.salary]
      }
    })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: company.color,
      borderWidth: 1,
      padding: 12,
      textStyle: { color: '#333' },
      formatter: params => {
        if (params.seriesType === 'scatter' || params.seriesType === 'effectScatter') {
          const [lng, lat, localSalary, baseSalary] = params.value
          return `
            <div style="font-weight:bold; font-size:15px; margin-bottom:6px; color:#1f2937">
              ${company.nameZh} · ${params.name}
            </div>
            <div style="font-size:12px; color:#6b7280; line-height:1.6;">
              <div>💰 总部参考：${baseSalary}k</div>
              <div style="color:${company.color}; font-weight:bold; font-size:13px; margin-top:2px;">
                📍 当地预估：~${localSalary.toFixed(1)}k
              </div>
            </div>
          `
        }
        return params.name
      }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.25,
      center: [106, 36],
      label: { show: false },
      itemStyle: {
        areaColor: '#f1f5f9', 
        borderColor: '#cbd5e1',
        borderWidth: 1,
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowBlur: 10
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e2e8f0'
        }
      }
    },
    series: [
      // 1. 涟漪特效：高亮薪资特别高的点（>45k）
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: { brushType: 'stroke', scale: 3 },
        // 大小映射：薪资
        symbolSize: val => Math.max(10, (val[2] - 20) * 1.5),
        itemStyle: {
          color: company.color,
          opacity: 0.8
        },
        data: scatterData.filter(d => d.value[2] > 45)
      },
      // 2. 实体圆圈：展示所有点
      {
        name: '薪资分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        // 大小映射：薪资 30k->15px, 60k->60px
        symbolSize: val => Math.max(12, (val[2] - 20) * 1.5),
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: '#374151',
          fontSize: 11,
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: [2, 4],
          borderRadius: 4
        },
        itemStyle: {
          color: company.color,
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
/* 样式复用之前的风格 */
.china-map-wrapper {
  display: flex;
  gap: 16px;
  height: 600px;
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
  background: rgba(255,255,255,0.95); padding: 12px;
  border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  font-size: 12px; color: #64748b; border: 1px solid #e2e8f0;
}
.legend-row { display: flex; align-items: center; margin-bottom: 8px; }
.legend-row:last-child { margin-bottom: 0; }
.dot { display: inline-block; margin-right: 8px; }
.size-dot { width: 12px; height: 12px; background: #94a3b8; border-radius: 50%; }
.color-dot { width: 12px; height: 12px; background: linear-gradient(135deg, #4f46e5, #ec4899); border-radius: 2px; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
</style>