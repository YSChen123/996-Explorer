<template>
  <div class="role-chart-container">
    <div class="glass-panel">
      <!-- 头部区域 -->
      <div class="header-section">
        <div class="title-group">
          <div class="title-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 3V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 16H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 13H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 class="main-title">岗位类型结构对比分析</h1>
            <p class="subtitle">深度洞察企业组织架构与人才分布</p>
          </div>
        </div>
        
        <div class="control-panel">
          <div class="control-group">
            <div class="control-label">
              <span class="control-icon">🏢</span>
              <span>选择公司</span>
            </div>
            <div class="select-wrapper">
              <select v-model="activeIndexStr" class="styled-select">
                <option v-for="(c,i) in companies" :key="c.name" :value="String(i)">{{ c.name }}</option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>
          
          <div class="control-group">
            <div class="control-label">
              <span class="control-icon">📊</span>
              <span>排序方式</span>
            </div>
            <div class="select-wrapper">
              <select v-model="sortBy" class="styled-select">
                <option value="name">公司名称</option>
                <option value="dev">研发占比</option>
                <option value="product">产品占比</option>
                <option value="ops">运营占比</option>
                <option value="marketing">市场占比</option>
                <option value="support">职能占比</option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>
          
          <div class="control-group">
            <div class="control-label">
              <span class="control-icon">📈</span>
              <span>分析维度</span>
            </div>
            <div class="select-wrapper">
              <select v-model="barMetric" class="styled-select">
                <option value="dev">研发岗位</option>
                <option value="product">产品岗位</option>
                <option value="ops">运营岗位</option>
                <option value="marketing">市场岗位</option>
                <option value="support">职能岗位</option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn-primary" @click="exportPNG">
              <span class="btn-icon">🖼️</span>
              导出图表
            </button>
            <button class="btn-secondary" @click="toggleDataView">
              <span class="btn-icon">{{ showDataTable ? '📊' : '📋' }}</span>
              {{ showDataTable ? '图表视图' : '数据视图' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 数据概览卡片 -->
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #60a5fa, #3b82f6);">
              <span>👨‍💻</span>
            </div>
            <div class="card-title">研发占比</div>
          </div>
          <div class="card-value">{{ currentCompany?.dev ?? 0 }}%</div>
          <div class="card-change" :class="getTrendClass('dev')">
            <span>{{ getRank('dev') }}位</span>
            <span>行业排名</span>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #34d399, #10b981);">
              <span>📱</span>
            </div>
            <div class="card-title">产品占比</div>
          </div>
          <div class="card-value">{{ currentCompany?.product ?? 0 }}%</div>
          <div class="card-change" :class="getTrendClass('product')">
            <span>{{ getRank('product') }}位</span>
            <span>行业排名</span>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
              <span>⚙️</span>
            </div>
            <div class="card-title">运营占比</div>
          </div>
          <div class="card-value">{{ currentCompany?.ops ?? 0 }}%</div>
          <div class="card-change" :class="getTrendClass('ops')">
            <span>{{ getRank('ops') }}位</span>
            <span>行业排名</span>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #fb7185, #f43f5e);">
              <span>📢</span>
            </div>
            <div class="card-title">市场占比</div>
          </div>
          <div class="card-value">{{ currentCompany?.marketing ?? 0 }}%</div>
          <div class="card-change" :class="getTrendClass('marketing')">
            <span>{{ getRank('marketing') }}位</span>
            <span>行业排名</span>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #a78bfa, #8b5cf6);">
              <span>🏛️</span>
            </div>
            <div class="card-title">职能占比</div>
          </div>
          <div class="card-value">{{ currentCompany?.support ?? 0 }}%</div>
          <div class="card-change" :class="getTrendClass('support')">
            <span>{{ getRank('support') }}位</span>
            <span>行业排名</span>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="legend-section">
        <div class="legend-title">岗位类型颜色标识</div>
        <div class="legend-items">
          <div v-for="k in keys" :key="k" class="legend-item" @mouseover="highlightSegment(k)" @mouseleave="unhighlightSegment">
            <div class="legend-color" :style="{ background: colors[k] }"></div>
            <div class="legend-text">
              <span class="legend-label">{{ labels[k] }}</span>
              <span class="legend-value">{{ currentCompany?.[k] ?? 0 }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主可视化区域 -->
      <div v-if="!showDataTable" class="visualization-section">
        <!-- 左：环形图 -->
        <div class="donut-section">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-icon">🔄</span>
              岗位结构分布图
            </h3>
            <div class="company-info">
              <div class="company-name">{{ currentCompany?.name || '请选择公司' }}</div>
              <div class="company-tag">总岗位数：100%</div>
            </div>
          </div>
          
          <div class="donut-container">
            <svg :width="donutSize" :height="donutSize" class="donut-chart" ref="donutSvg">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="0" dy="2" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.2"/>
                  </feComponentTransfer>
                  <feMerge> 
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/> 
                  </feMerge>
                </filter>
              </defs>
              
              <g :transform="`translate(${donutCenter},${donutCenter})`">
                <!-- 背景圆环 -->
                <circle :r="donutOuter + 5" fill="rgba(255,255,255,0.1)" />
                
                <!-- 数据圆环 -->
                <template v-for="seg in donutSegments" :key="'seg-'+seg.key">
                  <path
                    :d="arcPath(seg.start, seg.end, donutOuter, donutInner)"
                    :fill="colors[seg.key]"
                    :stroke="colors[seg.key]"
                    stroke-width="2"
                    :opacity="hoverKey && hoverKey !== seg.key ? 0.5 : 1"
                    :transform="hoverKey === seg.key ? 'scale(1.02)' : 'scale(1)'"
                    :filter="hoverKey === seg.key ? 'url(#shadow)' : 'none'"
                    @mouseenter="hoverKey = seg.key"
                    @mouseleave="hoverKey = ''"
                    style="transition: all 0.3s ease; cursor: pointer;"
                  >
                    <title>{{ labels[seg.key] }}：{{ seg.value }}%</title>
                  </path>
                </template>
                
                <!-- 中心区域 -->
                <circle :r="donutInner" fill="#ffffff" filter="url(#shadow)" />
                <circle :r="donutInner - 2" fill="rgba(255,255,255,0.95)" />
                
                <!-- 中心文字 -->
                <text y="-20" text-anchor="middle" class="center-title">
                  {{ currentCompany?.name || '' }}
                </text>
                <text y="0" text-anchor="middle" class="center-subtitle">
                  岗位结构
                </text>
                <text y="25" text-anchor="middle" class="center-value">
                  {{ getLargestCategory() }}
                </text>
              </g>
            </svg>
            
            <div class="donut-details">
              <div class="detail-list">
                <div v-for="seg in donutSegments" :key="'detail-'+seg.key" 
                     class="detail-item" :class="{ active: hoverKey === seg.key }"
                     @mouseenter="hoverKey = seg.key" @mouseleave="hoverKey = ''">
                  <div class="detail-color" :style="{ background: colors[seg.key] }"></div>
                  <div class="detail-info">
                    <div class="detail-label">{{ labels[seg.key] }}</div>
                    <div class="detail-value">{{ seg.value }}%</div>
                  </div>
                  <div class="detail-angle">{{ Math.round((seg.end - seg.start) * 180 / Math.PI) }}°</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分析徽章 -->
          <div class="insight-section">
            <div class="insight-title">公司特点分析</div>
            <div class="badge-container">
              <div class="badge" v-if="currentCompany && currentCompany.dev >= 55" style="background: linear-gradient(135deg, #60a5fa, #3b82f6);">
                🚀 技术驱动型
              </div>
              <div class="badge" v-if="currentCompany && currentCompany.product >= 22" style="background: linear-gradient(135deg, #34d399, #10b981);">
                🎯 产品导向型
              </div>
              <div class="badge" v-if="currentCompany && (currentCompany.ops + currentCompany.marketing) >= 40" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                📈 增长驱动型
              </div>
              <div class="badge" v-if="currentCompany && currentCompany.support >= 18" style="background: linear-gradient(135deg, #a78bfa, #8b5cf6);">
                🏛️ 稳健运营型
              </div>
              <div class="badge" v-if="currentCompany && currentCompany.dev >= 50 && currentCompany.product >= 20" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                💡 创新平衡型
              </div>
            </div>
          </div>
        </div>

        <!-- 右：条形图 -->
        <div class="bar-section">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-icon">📊</span>
              各公司对比分析
              <span class="metric-label">{{ labels[barMetric] }}占比</span>
            </h3>
            <div class="stats-info">
              <div class="stat-item">
                <div class="stat-label">平均</div>
                <div class="stat-value">{{ getAverage(barMetric) }}%</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">最高</div>
                <div class="stat-value">{{ getMax(barMetric) }}%</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">最低</div>
                <div class="stat-value">{{ getMin(barMetric) }}%</div>
              </div>
            </div>
          </div>
          
          <div class="bar-chart-container">
            <svg :width="barsW" :height="barsH" class="bar-chart">
              <!-- 背景网格 -->
              <defs>
                <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(203, 213, 224, 0.3)" stroke-width="1"/>
                </pattern>
              </defs>
              <rect :width="barsW" :height="barsH" fill="url(#gridPattern)" />
              
              <!-- Y轴和网格 -->
              <template v-for="t in yTicks" :key="'grid-'+t">
                <line
                  :x1="paddingLeft"
                  :x2="barsW - paddingRight"
                  :y1="yScale(t)"
                  :y2="yScale(t)"
                  stroke="rgba(203, 213, 224, 0.5)"
                  stroke-dasharray="4 4"
                />
                <text
                  :x="paddingLeft - 8"
                  :y="yScale(t) + 4"
                  text-anchor="end"
                  class="axis-text"
                >{{ t }}%</text>
              </template>
              
              <!-- X轴 -->
              <line
                :x1="paddingLeft"
                :y1="barsH - paddingBottom"
                :x2="barsW - paddingRight"
                :y2="barsH - paddingBottom"
                stroke="#cbd5e0"
                stroke-width="2"
              />
              <line
                :x1="paddingLeft"
                :y1="paddingTop"
                :x2="paddingLeft"
                :y2="barsH - paddingBottom"
                stroke="#cbd5e0"
                stroke-width="2"
              />
              
              <!-- 条形 -->
              <template v-for="(c,i) in sortedCompanies" :key="'bar-'+c.name">
                <!-- 条形背景 -->
                <rect
                  :x="xScale(i) - 2"
                  :y="paddingTop"
                  :width="barWidth + 4"
                  :height="barsH - paddingBottom - paddingTop"
                  fill="rgba(255,255,255,0)"
                  @mouseenter="hoverBarIndex = i"
                  @mouseleave="hoverBarIndex = -1"
                  style="cursor: pointer;"
                />
                
                <!-- 条形 -->
                <rect
                  :x="xScale(i)"
                  :y="yScale(c[barMetric])"
                  :width="barWidth"
                  :height="yScale(0) - yScale(c[barMetric])"
                  :fill="getBarColor(c[barMetric])"
                  rx="8"
                  @click="activeIndex = companies.findIndex(cc => cc.name === c.name)"
                  :class="{ 'bar-hover': hoverBarIndex === i }"
                  :transform="hoverBarIndex === i ? 'scale(1.02, 1)' : 'scale(1, 1)'"
                  style="transition: all 0.3s ease;"
                >
                  <title>{{ c.name }} - {{ labels[barMetric] }}：{{ c[barMetric] }}%</title>
                </rect>
                
                <!-- 条形数值 -->
                <text
                  :x="xScale(i) + barWidth/2"
                  :y="yScale(c[barMetric]) - 10"
                  text-anchor="middle"
                  class="bar-value"
                  :opacity="hoverBarIndex === i ? 1 : 0.8"
                >
                  {{ c[barMetric] }}%
                </text>
                
                <!-- 公司名称 -->
                <text
                  :x="xScale(i) + barWidth/2"
                  :y="barsH - paddingBottom + 20"
                  text-anchor="middle"
                  class="company-label"
                  :class="{ 'active-company': currentCompany && currentCompany.name === c.name }"
                >
                  {{ c.name }}
                </text>
                
                <!-- 选中高亮 -->
                <rect
                  v-if="currentCompany && currentCompany.name === c.name"
                  :x="xScale(i) - 6"
                  :y="yScale(c[barMetric]) - 6"
                  :width="barWidth + 12"
                  :height="(yScale(0) - yScale(c[barMetric])) + 12"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.3)"
                  stroke-width="3"
                  stroke-dasharray="6 6"
                  rx="12"
                />
              </template>
              
              <!-- 平均值线 -->
              <line
                :x1="paddingLeft"
                :x2="barsW - paddingRight"
                :y1="yScale(getAverage(barMetric))"
                :y2="yScale(getAverage(barMetric))"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-dasharray="6 6"
              />
              <text
                :x="barsW - paddingRight + 10"
                :y="yScale(getAverage(barMetric)) + 4"
                text-anchor="start"
                class="average-label"
              >
                平均 {{ getAverage(barMetric) }}%
              </text>
            </svg>
          </div>
          
          <!-- 排名列表 -->
          <div class="ranking-section">
            <div class="ranking-header">
              <h4 class="ranking-title">公司 {{ labels[barMetric] }} 占比排名</h4>
              <div class="ranking-stats">{{ rankingList.length }} 家公司</div>
            </div>
            <div class="ranking-list">
              <div v-for="(c, index) in rankingList.slice(0, 5)" :key="'rk-'+c.name" 
                   class="ranking-item" :class="{ 'top-rank': index < 3 }"
                   @click="activeIndex = companies.findIndex(cc => cc.name === c.name)">
                <div class="rank-number">{{ index + 1 }}</div>
                <div class="rank-info">
                  <div class="rank-name">{{ c.name }}</div>
                  <div class="rank-value">{{ c[barMetric] }}%</div>
                </div>
                <div class="rank-bar">
                  <div class="rank-bar-fill" :style="{ width: (c[barMetric] / getMax(barMetric)) * 100 + '%', background: colors[barMetric] }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据表格视图 -->
      <div v-else class="data-table-section">
        <div class="table-header">
          <h3 class="section-title">
            <span class="title-icon">📋</span>
            详细数据表格
          </h3>
          <div class="table-actions">
            <button class="btn-outline" @click="exportCSV">
              <span class="btn-icon">📥</span>
              导出CSV
            </button>
          </div>
        </div>
        
        <div class="table-container">
          <table class="styled-table">
            <thead>
              <tr>
                <th @click="sortTable('name')" class="sortable">
                  公司名称
                  <span v-if="tableSortBy === 'name'" class="sort-indicator">▼</span>
                </th>
                <th v-for="k in keys" :key="'th-'+k" 
                    @click="sortTable(k)" class="sortable"
                    :style="{ color: colors[k] }">
                  {{ labels[k] }}
                  <span v-if="tableSortBy === k" class="sort-indicator">▼</span>
                </th>
                <th>总计</th>
                <th>主要岗位类型</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in sortedTableData" :key="'row-'+c.name" 
                  :class="{ 'active-row': currentCompany && currentCompany.name === c.name }"
                  @click="activeIndex = companies.findIndex(cc => cc.name === c.name)">
                <td class="company-cell">
                  <div class="company-badge">{{ c.name }}</div>
                </td>
                <td v-for="k in keys" :key="'td-'+c.name+'-'+k" class="data-cell">
                  <div class="data-value">{{ c[k] }}%</div>
                  <div class="data-bar" :style="{ width: c[k] + '%', background: colors[k] }"></div>
                </td>
                <td class="total-cell">
                  {{ getTotal(c) }}%
                </td>
                <td class="dominant-cell">
                  <span class="dominant-tag" :style="{ background: colors[getDominantCategory(c)] }">
                    {{ labels[getDominantCategory(c)] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 底部说明 -->
      <div class="footer-section">
        <div class="footer-content">
          <div class="footer-icon">💡</div>
          <div class="footer-text">
            <strong>使用说明：</strong> 
            数据为各岗位类型占比（总和约100%）。点击条形或选择框切换公司视图，可通过排序与维度切换观察结构差异。图表支持交互悬停查看详情。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { name: '阿里巴巴', dev: 52, product: 18, ops: 14, marketing: 6, support: 10 },
      { name: '腾讯', dev: 49, product: 20, ops: 15, marketing: 7, support: 9 },
      { name: '字节跳动', dev: 55, product: 17, ops: 12, marketing: 6, support: 10 },
      { name: '美团', dev: 46, product: 19, ops: 18, marketing: 7, support: 10 },
      { name: '小米科技', dev: 50, product: 18, ops: 14, marketing: 6, support: 12 },
      { name: '华为', dev: 58, product: 14, ops: 10, marketing: 4, support: 14 },
      { name: '京东', dev: 48, product: 19, ops: 16, marketing: 7, support: 10 },
      { name: '网易', dev: 51, product: 18, ops: 13, marketing: 6, support: 12 },
      { name: '快手', dev: 53, product: 17, ops: 14, marketing: 6, support: 10 },
      { name: '百度', dev: 56, product: 16, ops: 11, marketing: 5, support: 12 },
      { name: '拼多多', dev: 47, product: 21, ops: 16, marketing: 8, support: 8 },
      { name: '滴滴出行', dev: 50, product: 19, ops: 15, marketing: 6, support: 10 }
    ]
  },
  colors: {
    type: Object,
    default: () => ({
      dev:       '#60a5fa',
      product:   '#34d399',
      ops:       '#f59e0b',
      marketing: '#fb7185',
      support:   '#a78bfa'
    })
  }
})

const labels = { dev: '研发', product: '产品', ops: '运营', marketing: '市场', support: '职能' }
const keys = ['dev', 'product', 'ops', 'marketing', 'support']

// 公司与选择
const companies = computed(() => props.data.map(c => ({ ...c })))
const activeIndex = ref(0)
const activeIndexStr = computed({
  get: () => String(activeIndex.value),
  set: v => { activeIndex.value = Number(v) }
})
const currentCompany = computed(() => companies.value[activeIndex.value] || null)

// 视图控制
const showDataTable = ref(false)
const hoverKey = ref('')
const hoverBarIndex = ref(-1)

// 表格排序
const tableSortBy = ref('name')
const tableSortDirection = ref('asc')

// 分组条形图设置
const barsW = 900
const barsH = 380
const paddingLeft = 60
const paddingRight = 40
const paddingTop = 30
const paddingBottom = 60
const barGap = 20

const yTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const yScale = (p) => {
  const y0 = paddingTop
  const y1 = barsH - paddingBottom
  return y1 - (p / 100) * (y1 - y0)
}

const sortBy = ref('name')
const barMetric = ref('dev')

const sortedCompanies = computed(() => {
  const arr = [...companies.value]
  if (sortBy.value === 'name') {
    arr.sort((a,b) => String(a.name).localeCompare(String(b.name), 'zh-CN'))
  } else {
    arr.sort((a,b) => (b[sortBy.value] || 0) - (a[sortBy.value] || 0))
  }
  return arr
})

const barWidth = computed(() => {
  const usable = barsW - paddingLeft - paddingRight
  const n = sortedCompanies.value.length
  return Math.max(20, (usable - (n - 1) * barGap) / n)
})
const xScale = (i) => paddingLeft + i * (barWidth.value + barGap)

const rankingList = computed(() => {
  return [...companies.value].sort((a,b) => (b[barMetric.value] || 0) - (a[barMetric.value] || 0))
})

// 环形图设置
const donutSize = 380
const donutCenter = donutSize / 2
const donutOuter = donutSize * 0.40
const donutInner = donutSize * 0.22

const donutSegments = computed(() => {
  if (!currentCompany.value) return []
  const total = keys.reduce((s,k) => s + (currentCompany.value[k] || 0), 0) || 100
  let acc = 0
  return keys.map(k => {
    const v = currentCompany.value[k] || 0
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2
    acc += v
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2
    return { key: k, value: v, start, end }
  })
})

function arcPath(start, end, rOuter, rInner) {
  const largeArc = end - start > Math.PI ? 1 : 0
  const sx = Math.cos(start) * rOuter
  const sy = Math.sin(start) * rOuter
  const ex = Math.cos(end) * rOuter
  const ey = Math.sin(end) * rOuter
  const isx = Math.cos(end) * rInner
  const isy = Math.sin(end) * rInner
  const iex = Math.cos(start) * rInner
  const iey = Math.sin(start) * rInner
  return [
    `M ${sx} ${sy}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${ex} ${ey}`,
    `L ${isx} ${isy}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iex} ${iey}`,
    'Z'
  ].join(' ')
}

// 辅助函数
function getAverage(metric) {
  const sum = companies.value.reduce((s, c) => s + (c[metric] || 0), 0)
  return Math.round((sum / companies.value.length) * 10) / 10
}

function getMax(metric) {
  return Math.max(...companies.value.map(c => c[metric] || 0))
}

function getMin(metric) {
  return Math.min(...companies.value.map(c => c[metric] || 0))
}

function getRank(metric) {
  const sorted = [...companies.value].sort((a,b) => (b[metric] || 0) - (a[metric] || 0))
  const rank = sorted.findIndex(c => c.name === currentCompany.value?.name) + 1
  return rank
}

function getTrendClass(metric) {
  const rank = getRank(metric)
  if (rank <= 3) return 'trend-up'
  if (rank <= 6) return 'trend-neutral'
  return 'trend-down'
}

function getLargestCategory() {
  if (!currentCompany.value) return ''
  let maxKey = 'dev'
  keys.forEach(k => {
    if (currentCompany.value[k] > currentCompany.value[maxKey]) {
      maxKey = k
    }
  })
  return labels[maxKey] + '为主'
}

function getBarColor(value) {
  const colors = [
    '#cbd5e0', '#a0aec0', '#718096', '#4a5568', '#2d3748'
  ]
  const index = Math.min(Math.floor(value / 20), 4)
  return colors[index]
}

function highlightSegment(key) {
  hoverKey.value = key
}

function unhighlightSegment() {
  hoverKey.value = ''
}

// 表格相关函数
function sortTable(column) {
  if (tableSortBy.value === column) {
    tableSortDirection.value = tableSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    tableSortBy.value = column
    tableSortDirection.value = 'asc'
  }
}

const sortedTableData = computed(() => {
  const arr = [...companies.value]
  arr.sort((a, b) => {
    let aVal = a[tableSortBy.value] || a.name
    let bVal = b[tableSortBy.value] || b.name
    
    if (typeof aVal === 'string') {
      return tableSortDirection.value === 'asc' 
        ? aVal.localeCompare(bVal, 'zh-CN')
        : bVal.localeCompare(aVal, 'zh-CN')
    } else {
      return tableSortDirection.value === 'asc' 
        ? aVal - bVal
        : bVal - aVal
    }
  })
  return arr
})

function getTotal(company) {
  return keys.reduce((sum, k) => sum + (company[k] || 0), 0)
}

function getDominantCategory(company) {
  let maxKey = 'dev'
  keys.forEach(k => {
    if (company[k] > company[maxKey]) {
      maxKey = k
    }
  })
  return maxKey
}

// 导出功能
function exportPNG() {
  const svgEl = document.querySelector('.donut-chart')
  if (!svgEl) return
  
  const xml = new XMLSerializer().serializeToString(svgEl)
  const svg64 = btoa(unescape(encodeURIComponent(xml)))
  const image64 = 'data:image/svg+xml;base64,' + svg64
  
  const canvas = document.createElement('canvas')
  canvas.width = donutSize * 2
  canvas.height = donutSize * 2
  const ctx = canvas.getContext('2d')
  
  // 绘制白色背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, donutSize/2, donutSize/2, donutSize, donutSize)
    
    // 添加标题
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#1a202c'
    ctx.textAlign = 'center'
    ctx.fillText(`${currentCompany.value?.name || '公司'}岗位结构分布图`, canvas.width/2, 40)
    
    // 添加时间戳
    ctx.font = '12px Arial'
    ctx.fillStyle = '#718096'
    const now = new Date()
    const timestamp = now.toLocaleString('zh-CN')
    ctx.fillText(`生成时间：${timestamp}`, canvas.width/2, canvas.height - 20)
    
    // 下载
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `${currentCompany.value?.name || '公司'}-岗位结构图.png`
    a.click()
  }
  img.src = image64
}

function exportCSV() {
  const headers = ['公司名称', ...keys.map(k => labels[k]), '总计', '主要岗位类型']
  const rows = companies.value.map(c => {
    const total = getTotal(c)
    const dominant = labels[getDominantCategory(c)]
    return [c.name, ...keys.map(k => `${c[k]}%`), `${total}%`, dominant]
  })
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '公司岗位结构数据.csv'
  link.click()
}

function toggleDataView() {
  showDataTable.value = !showDataTable.value
}

// 初始化
onMounted(() => {
  console.log('岗位结构图表组件已加载')
})
</script>

<style scoped>
.role-chart-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a202c;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.glass-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #60a5fa, #34d399, #f59e0b, #fb7185, #a78bfa);
  z-index: 1;
}

/* 头部样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.control-panel {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
}

.control-icon {
  font-size: 14px;
}

.select-wrapper {
  position: relative;
}

.styled-select {
  appearance: none;
  padding: 10px 36px 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #2d3748;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.styled-select:hover {
  border-color: #cbd5e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.styled-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  pointer-events: none;
  font-size: 10px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-primary, .btn-secondary, .btn-outline {
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-outline {
  background: transparent;
  color: #4a5568;
  border: 1px solid #cbd5e0;
}

.btn-outline:hover {
  background: #f7fafc;
}

.btn-icon {
  font-size: 16px;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: inherit;
  opacity: 0.6;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.card-title {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  line-height: 1;
}

.card-change {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f7fafc;
}

.trend-up {
  color: #38a169;
  background: #f0fff4;
}

.trend-neutral {
  color: #d69e2e;
  background: #fffbeb;
}

.trend-down {
  color: #e53e3e;
  background: #fff5f5;
}

/* 图例 */
.legend-section {
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.legend-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-label {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.legend-value {
  font-size: 14px;
  color: #718096;
  font-weight: 600;
}

/* 可视化区域 */
.visualization-section {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .visualization-section {
    grid-template-columns: 1fr;
  }
}

.donut-section, .bar-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.title-icon {
  font-size: 20px;
}

.metric-label {
  background: #edf2f7;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: #4a5568;
  margin-left: 8px;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  padding: 6px 16px;
  background: #f7fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.company-tag {
  font-size: 12px;
  color: #718096;
  padding: 4px 10px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stats-info {
  display: flex;
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
}

/* 环形图 */
.donut-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.donut-chart {
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.08));
}

.center-title {
  font-size: 20px;
  font-weight: 700;
  fill: #1a202c;
}

.center-subtitle {
  font-size: 14px;
  fill: #718096;
}

.center-value {
  font-size: 16px;
  font-weight: 600;
  fill: #4a5568;
}

.donut-details {
  flex: 1;
  min-width: 200px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  background: #f7fafc;
  transition: all 0.2s ease;
  cursor: pointer;
}

.detail-item:hover, .detail-item.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.detail-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.detail-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
}

.detail-angle {
  font-size: 12px;
  color: #a0aec0;
  background: white;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 洞察区域 */
.insight-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.insight-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 条形图区域 */
.bar-chart-container {
  margin: 20px 0;
  overflow-x: auto;
}

.bar-chart {
  display: block;
  min-width: 800px;
}

.axis-text {
  font-size: 11px;
  fill: #718096;
  font-weight: 500;
}

.bar-value {
  font-size: 12px;
  fill: #2d3748;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.company-label {
  font-size: 12px;
  fill: #718096;
  font-weight: 500;
  transition: all 0.2s ease;
}

.company-label.active-company {
  fill: #667eea;
  font-weight: 600;
  font-size: 13px;
}

.average-label {
  font-size: 12px;
  fill: #d69e2e;
  font-weight: 600;
}

.bar-hover {
  opacity: 0.9;
  filter: brightness(1.1);
}

/* 排名区域 */
.ranking-section {
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid #e2e8f0;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ranking-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.ranking-stats {
  font-size: 12px;
  color: #718096;
  background: white;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ranking-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-item.top-rank {
  border-color: #fed7d7;
  background: linear-gradient(to right, #fff5f5, white);
}

.rank-number {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #edf2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  flex-shrink: 0;
}

.top-rank .rank-number {
  background: #fed7d7;
  color: #c53030;
}

.rank-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rank-name {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.rank-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
}

.rank-bar {
  width: 80px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.rank-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 数据表格 */
.data-table-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.styled-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.styled-table th {
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.styled-table th:hover {
  background: #edf2f7;
}

.sortable {
  user-select: none;
}

.sort-indicator {
  margin-left: 4px;
  font-size: 10px;
}

.styled-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s ease;
}

.styled-table tr:hover td {
  background: #f7fafc;
}

.styled-table tr.active-row td {
  background: #f0fff4;
}

.company-cell {
  font-weight: 600;
  color: #2d3748;
}

.company-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #edf2f7;
  border-radius: 8px;
  font-size: 14px;
}

.data-cell {
  position: relative;
  min-width: 100px;
}

.data-value {
  position: relative;
  z-index: 2;
  font-weight: 600;
}

.data-bar {
  position: absolute;
  left: 16px;
  bottom: 16px;
  height: 8px;
  border-radius: 4px;
  opacity: 0.2;
  transition: opacity 0.2s ease;
}

.data-cell:hover .data-bar {
  opacity: 0.3;
}

.total-cell {
  font-weight: 700;
  color: #1a202c;
  font-size: 16px;
}

.dominant-cell {
  text-align: center;
}

.dominant-tag {
  display: inline-block;
  padding: 6px 12px;
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 底部说明 */
.footer-section {
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.footer-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.footer-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.footer-text {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
}

.footer-text strong {
  color: #2d3748;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .glass-panel {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
  }
  
  .visualization-section {
    gap: 16px;
  }
  
  .overview-cards {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
  
  .donut-container {
    flex-direction: column;
  }
}
</style>