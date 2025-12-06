<template>
  <div class="tech-stack-visualization">
    <!-- 头部区域 -->
    <header class="app-header">
      <h1><i class="icon">💻</i> 技术栈可视化分析系统</h1>
      <p class="subtitle">分析国内科技公司的技术栈与技能关键词分布</p>
    </header>

    <!-- 主控制面板 -->
    <main class="main-content">
      <!-- 左侧控制面板 -->
      <section class="control-panel">
        <!-- 公司选择区域 -->
        <div class="section-card">
          <h3><i class="icon">🏢</i> 选择公司（多选）</h3>
          <div class="selected-companies" v-if="selectedCompanies.length > 0">
            <div class="selected-tags">
              <span class="tag" v-for="company in selectedCompanies" :key="company.id">
                {{ company.name }}
                <button class="tag-remove" @click="toggleCompany(company.id)">×</button>
              </span>
            </div>
            <div class="selected-count">
              已选择 {{ selectedCompanies.length }} 家公司
              <button v-if="selectedCompanies.length > 0" @click="clearSelection" class="clear-btn">
                清空选择
              </button>
            </div>
          </div>
          <div class="company-list">
            <div
              class="company-item"
              v-for="company in companies"
              :key="company.id"
              :class="{ selected: isCompanySelected(company.id) }"
              @click="toggleCompany(company.id)"
            >
              <input
                type="checkbox"
                :id="`company-${company.id}`"
                :checked="isCompanySelected(company.id)"
                @change="toggleCompany(company.id)"
              />
              <label :for="`company-${company.id}`" class="company-label">
                <span class="company-name">{{ company.name }}</span>
                <span class="tech-count">{{ company.techStack.length }} 项技术</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 技术筛选区域 -->
        <div class="section-card">
          <h3><i class="icon">🔍</i> 技术筛选</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="techFilter"
              placeholder="输入技术关键词进行筛选..."
              class="search-input"
            />
          </div>
          <div class="tech-filter">
            <div
              class="tech-tag"
              v-for="tech in filteredTechTags"
              :key="tech.name"
              :class="{ active: techFilter === tech.name }"
              @click="toggleTechFilter(tech.name)"
            >
              {{ tech.name }}
              <span class="tech-count">{{ tech.count }}</span>
            </div>
          </div>
        </div>

        <!-- 视图切换区域 -->
        <div class="section-card">
          <h3><i class="icon">📊</i> 可视化视图</h3>
          <div class="view-buttons">
            <button
              v-for="view in views"
              :key="view.id"
              :class="{ active: currentView === view.id }"
              @click="currentView = view.id"
              class="view-btn"
            >
              <i class="icon">{{ view.icon }}</i> {{ view.name }}
            </button>
          </div>
        </div>

        <!-- 数据操作区域 -->
        <div class="section-card">
          <h3><i class="icon">⚙️</i> 数据操作</h3>
          <div class="action-buttons">
            <button @click="exportData" class="action-btn">
              <i class="icon">📥</i> 导出数据
            </button>
            <button @click="resetAll" class="action-btn">
              <i class="icon">🔄</i> 重置所有
            </button>
            <button @click="toggleDarkMode" class="action-btn">
              <i class="icon">{{ darkMode ? '☀️' : '🌙' }}</i> {{ darkMode ? '浅色模式' : '深色模式' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 右侧可视化区域 -->
      <section class="visualization-area">
        <!-- 视图选择提示 -->
        <div class="view-header">
          <h2>
            <i class="icon">{{ currentViewConfig.icon }}</i>
            {{ currentViewConfig.name }}
            <span v-if="selectedCompanies.length > 0" class="view-subtitle">
              - 分析 {{ selectedCompanies.length }} 家公司
            </span>
          </h2>
          <div class="view-description">{{ currentViewConfig.description }}</div>
        </div>

        <!-- 无选择时的提示 -->
        <div v-if="selectedCompanies.length === 0" class="empty-state">
          <div class="empty-icon">👆</div>
          <h3>请选择至少一家公司</h3>
          <p>从左侧面板选择您想要分析的公司，系统将自动生成可视化图表</p>
          <div class="sample-hint">
            提示：您可以尝试选择
            <button @click="selectSampleCompanies" class="sample-btn">示例公司组</button>
            快速体验
          </div>
        </div>

        <!-- 词云视图 -->
        <div v-else-if="currentView === 'wordcloud'" class="visualization-container">
          <div class="chart-container">
            <div class="chart-header">
              <h3>公司技术栈词云</h3>
              <div class="chart-controls">
                <label>
                  最大词数：
                  <input
                    type="range"
                    min="10"
                    max="50"
                    v-model="wordCloudMaxWords"
                    class="range-slider"
                  />
                  <span>{{ wordCloudMaxWords }}</span>
                </label>
              </div>
            </div>
            <div class="wordclouds-container">
              <div
                class="wordcloud-card"
                v-for="company in selectedCompanies"
                :key="company.id"
              >
                <h4>{{ company.name }}</h4>
                <div :id="`wordcloud-${company.id}`" class="wordcloud"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 雷达图视图 -->
        <div v-else-if="currentView === 'radar'" class="visualization-container">
          <div class="chart-container">
            <div class="chart-header">
              <h3>技术栈雷达图对比</h3>
              <div class="chart-controls">
                <label>
                  <input type="checkbox" v-model="normalizeRadar" /> 标准化数据
                </label>
              </div>
            </div>
            <div class="radar-chart-container">
              <div ref="radarChart" class="radar-chart"></div>
            </div>
          </div>
        </div>

        <!-- 条形图视图 -->
        <div v-else-if="currentView === 'bar'" class="visualization-container">
          <div class="chart-container">
            <div class="chart-header">
              <h3>技术出现频率对比</h3>
              <div class="chart-controls">
                <label>
                  排序方式：
                  <select v-model="barSortBy" class="select-control">
                    <option value="frequency">频率</option>
                    <option value="alphabetical">字母顺序</option>
                  </select>
                </label>
              </div>
            </div>
            <div class="bar-chart-container">
              <div ref="barChart" class="bar-chart"></div>
            </div>
          </div>
        </div>

        <!-- 对照表视图 -->
        <div v-else-if="currentView === 'table'" class="visualization-container">
          <div class="table-container">
            <div class="table-header">
              <h3>公司 × 技术栈对照表</h3>
              <div class="table-controls">
                <label>
                  <input type="checkbox" v-model="tableShowWeights" /> 显示权重
                </label>
                <button @click="exportTableToCSV" class="export-btn">
                  <i class="icon">📋</i> 导出CSV
                </button>
              </div>
            </div>
            <div class="table-wrapper">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th class="sticky-header">公司</th>
                    <th
                      v-for="tech in tableTechs"
                      :key="tech"
                      :class="{
                        'highlight-tech': techFilter && tech.includes(techFilter),
                      }"
                    >
                      {{ tech }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="company in selectedCompanies" :key="company.id">
                    <td class="company-cell sticky-cell">{{ company.name }}</td>
                    <td
                      v-for="tech in tableTechs"
                      :key="tech"
                      :class="{
                        'has-tech': hasTechnology(company, tech),
                        'highlight-tech': techFilter && tech.includes(techFilter),
                      }"
                      :title="getTechWeight(company, tech)"
                    >
                      <div v-if="hasTechnology(company, tech)" class="tech-cell">
                        <span class="tech-icon">✅</span>
                        <span v-if="tableShowWeights" class="tech-weight">
                          {{ getTechWeight(company, tech) }}
                        </span>
                      </div>
                      <span v-else class="no-tech">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 技术分布视图 -->
        <div v-else-if="currentView === 'distribution'" class="visualization-container">
          <div class="chart-container">
            <div class="chart-header">
              <h3>技术分布热力图</h3>
              <div class="chart-controls">
                <label>
                  聚类：
                  <input type="checkbox" v-model="clusterHeatmap" />
                </label>
              </div>
            </div>
            <div class="heatmap-container">
              <div ref="heatmapChart" class="heatmap-chart"></div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部信息 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>技术栈可视化分析系统 • 数据基于公开JD分析 • 共收录 {{ companies.length }} 家科技公司</p>
        <p class="footer-note">
          提示：点击技术标签可筛选，点击图表元素可查看详细信息
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

// 响应式数据 - 替换为指定的9家公司
const companies = ref([
  { id: 1, name: '阿里', color: '#FF6A00', techStack: [
    { name: 'Java', weight: 10 }, { name: 'Spring Cloud', weight: 10 }, { name: '大数据', weight: 10 },
    { name: 'MySQL', weight: 9 }, { name: 'Redis', weight: 9 }, { name: 'Dubbo', weight: 9 },
    { name: '微服务', weight: 10 }, { name: '分布式系统', weight: 10 }, { name: '云计算', weight: 9 },
    { name: '容器化', weight: 8 }, { name: '中台架构', weight: 9 }, { name: 'OceanBase', weight: 8 }
  ]},
  { id: 2, name: '华为', color: '#FF0000', techStack: [
    { name: 'C++', weight: 10 }, { name: 'Java', weight: 9 }, { name: 'Python', weight: 8 },
    { name: '嵌入式开发', weight: 10 }, { name: '5G', weight: 10 }, { name: '云计算', weight: 9 },
    { name: 'AI芯片', weight: 8 }, { name: '分布式系统', weight: 9 }, { name: '容器化', weight: 8 },
    { name: '网络协议', weight: 9 }, { name: '鸿蒙系统', weight: 10 }, { name: '数据库', weight: 8 }
  ]},
  { id: 3, name: '京东', color: '#E6141E', techStack: [
    { name: 'Java', weight: 10 }, { name: 'Spring', weight: 9 }, { name: '大数据', weight: 9 },
    { name: '分布式系统', weight: 10 }, { name: '微服务', weight: 9 }, { name: '云计算', weight: 8 },
    { name: '容器化', weight: 8 }, { name: '物流系统', weight: 9 }, { name: '推荐算法', weight: 8 },
    { name: '供应链', weight: 9 }, { name: '高并发', weight: 10 }, { name: '消息队列', weight: 8 }
  ]},
  { id: 4, name: '百度', color: '#2932E1', techStack: [
    { name: 'Python', weight: 9 }, { name: 'C++', weight: 8 }, { name: 'Java', weight: 7 },
    { name: '机器学习', weight: 10 }, { name: '深度学习', weight: 10 }, { name: '自然语言处理', weight: 9 },
    { name: '搜索引擎', weight: 10 }, { name: '大数据', weight: 9 }, { name: '云计算', weight: 8 },
    { name: '推荐算法', weight: 9 }, { name: '知识图谱', weight: 8 }, { name: '自动驾驶', weight: 9 }
  ]},
  { id: 5, name: '美团', color: '#FFB300', techStack: [
    { name: 'Java', weight: 10 }, { name: 'Go', weight: 8 }, { name: 'Python', weight: 7 },
    { name: '大数据', weight: 9 }, { name: '分布式系统', weight: 10 }, { name: '微服务', weight: 10 },
    { name: '容器化', weight: 9 }, { name: '推荐算法', weight: 9 }, { name: '地理位置', weight: 9 },
    { name: '高并发', weight: 10 }, { name: '实时计算', weight: 8 }, { name: '消息队列', weight: 8 }
  ]},
  { id: 6, name: '腾讯', color: '#07C160', techStack: [
    { name: 'C++', weight: 9 }, { name: 'Go', weight: 8 }, { name: 'Java', weight: 8 },
    { name: 'Python', weight: 8 }, { name: '大数据', weight: 9 }, { name: '云计算', weight: 9 },
    { name: '微服务', weight: 9 }, { name: '游戏引擎', weight: 8 }, { name: '音视频', weight: 9 },
    { name: '即时通讯', weight: 10 }, { name: '容器化', weight: 8 }, { name: '小程序', weight: 9 }
  ]},
  { id: 7, name: '网易', color: '#D10A1B', techStack: [
    { name: 'C++', weight: 9 }, { name: 'Java', weight: 8 }, { name: 'Python', weight: 7 },
    { name: '游戏开发', weight: 10 }, { name: '大数据', weight: 8 }, { name: '云计算', weight: 8 },
    { name: '容器化', weight: 7 }, { name: '推荐算法', weight: 8 }, { name: '音视频', weight: 8 },
    { name: '网络安全', weight: 8 }, { name: '数据库', weight: 8 }, { name: '消息队列', weight: 7 }
  ]},
  { id: 8, name: '小米', color: '#FF6900', techStack: [
    { name: 'Java', weight: 9 }, { name: 'Kotlin', weight: 8 }, { name: 'C++', weight: 8 },
    { name: 'Android开发', weight: 10 }, { name: 'IoT', weight: 10 }, { name: '大数据', weight: 8 },
    { name: '云计算', weight: 8 }, { name: '嵌入式开发', weight: 9 }, { name: '智能硬件', weight: 9 },
    { name: '容器化', weight: 7 }, { name: '移动端', weight: 10 }, { name: '分布式系统', weight: 8 }
  ]},
  { id: 9, name: '字节', color: '#25F4EE', techStack: [
    { name: 'Go', weight: 9 }, { name: 'Python', weight: 9 }, { name: 'Java', weight: 8 },
    { name: 'React', weight: 8 }, { name: 'Vue.js', weight: 7 }, { name: '大数据', weight: 10 },
    { name: '推荐算法', weight: 10 }, { name: '微服务', weight: 9 }, { name: '容器化', weight: 8 },
    { name: '音视频处理', weight: 8 }, { name: '高并发', weight: 10 }, { name: '分布式系统', weight: 9 }
  ]}
])

const selectedCompanyIds = ref([1, 2, 3, 4]) // 默认选中前4家公司
const techFilter = ref('')
const currentView = ref('wordcloud')
const darkMode = ref(false)

// 图表配置
const wordCloudMaxWords = ref(30)
const normalizeRadar = ref(true)
const barSortBy = ref('frequency')
const tableShowWeights = ref(false)
const clusterHeatmap = ref(false)

// 视图配置
const views = ref([
  { id: 'wordcloud', name: '技术词云', icon: '☁️', description: '每家公司技术栈的词云展示，字体大小表示技术权重' },
  { id: 'radar', name: '雷达图', icon: '📈', description: '各公司技术栈雷达对比图，展示技术覆盖面' },
  { id: 'bar', name: '条形图', icon: '📊', description: '技术出现频率条形图，对比各公司技术使用情况' },
  { id: 'table', name: '对照表', icon: '📋', description: '公司×技术栈详细对照表，显示具体技术权重' },
  { id: 'distribution', name: '分布图', icon: '🔥', description: '技术分布热力图，展示技术在各公司的分布情况' }
])

// ECharts实例引用 - 使用对象存储词云实例
const wordcloudInstances = ref({})
const radarChart = ref(null)
const barChart = ref(null)
const heatmapChart = ref(null)
let radarChartInstance = null
let barChartInstance = null
let heatmapChartInstance = null

// 计算属性
const selectedCompanies = computed(() => {
  return companies.value.filter(company => 
    selectedCompanyIds.value.includes(company.id)
  )
})

const allTechs = computed(() => {
  const techSet = new Set()
  companies.value.forEach(company => {
    company.techStack.forEach(tech => {
      techSet.add(tech.name)
    })
  })
  return Array.from(techSet)
})

const filteredTechTags = computed(() => {
  const techCount = {}
  selectedCompanies.value.forEach(company => {
    company.techStack.forEach(tech => {
      if (!techCount[tech.name]) {
        techCount[tech.name] = { name: tech.name, count: 0 }
      }
      techCount[tech.name].count++
    })
  })
  
  let result = Object.values(techCount)
  
  // 按计数排序
  result.sort((a, b) => b.count - a.count)
  
  // 应用筛选
  if (techFilter.value) {
    result = result.filter(tech => 
      tech.name.toLowerCase().includes(techFilter.value.toLowerCase())
    )
  }
  
  return result.slice(0, 20) // 最多显示20个
})

const currentViewConfig = computed(() => {
  return views.value.find(view => view.id === currentView.value) || views.value[0]
})

const tableTechs = computed(() => {
  let techs = allTechs.value
  
  if (techFilter.value) {
    techs = techs.filter(tech => 
      tech.toLowerCase().includes(techFilter.value.toLowerCase())
    )
  }
  
  return techs
})

// 方法
const isCompanySelected = (companyId) => {
  return selectedCompanyIds.value.includes(companyId)
}

const toggleCompany = (companyId) => {
  const index = selectedCompanyIds.value.indexOf(companyId)
  if (index > -1) {
    selectedCompanyIds.value.splice(index, 1)
  } else {
    selectedCompanyIds.value.push(companyId)
  }
}

const clearSelection = () => {
  selectedCompanyIds.value = []
}

const toggleTechFilter = (techName) => {
  techFilter.value = techFilter.value === techName ? '' : techName
}

const exportData = () => {
  const data = {
    selectedCompanies: selectedCompanies.value.map(c => c.name),
    view: currentView.value,
    data: selectedCompanies.value.map(company => ({
      name: company.name,
      techStack: company.techStack
    }))
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `tech-stack-analysis-${new Date().toISOString().slice(0,10)}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

const resetAll = () => {
  selectedCompanyIds.value = [1, 2, 3, 4]
  techFilter.value = ''
  currentView.value = 'wordcloud'
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  if (darkMode.value) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

const selectSampleCompanies = () => {
  selectedCompanyIds.value = [1, 3, 5, 7, 9]
}

const hasTechnology = (company, techName) => {
  return company.techStack.some(tech => tech.name === techName)
}

const getTechWeight = (company, techName) => {
  const tech = company.techStack.find(tech => tech.name === techName)
  return tech ? tech.weight : 0
}

const exportTableToCSV = () => {
  const headers = ['公司', ...tableTechs.value]
  const rows = selectedCompanies.value.map(company => {
    const row = [company.name]
    tableTechs.value.forEach(tech => {
      const techItem = company.techStack.find(t => t.name === tech)
      row.push(techItem ? techItem.weight : 0)
    })
    return row
  })
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `tech-comparison-${new Date().toISOString().slice(0,10)}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 图表渲染方法 - 修复词云渲染bug
const renderWordClouds = () => {
  // 等待DOM更新完成
  nextTick(() => {
    // 清除已不存在的公司词云实例
    Object.keys(wordcloudInstances.value).forEach(companyId => {
      if (!selectedCompanyIds.value.includes(parseInt(companyId))) {
        if (wordcloudInstances.value[companyId]) {
          wordcloudInstances.value[companyId].dispose()
        }
        delete wordcloudInstances.value[companyId]
      }
    })
    
    // 为每个选中的公司创建词云
    selectedCompanies.value.forEach((company) => {
      const containerId = `wordcloud-${company.id}`
      const container = document.getElementById(containerId)
      
      if (!container) {
        console.warn(`找不到词云容器: ${containerId}`)
        return
      }
      
      // 如果已存在实例，先销毁
      if (wordcloudInstances.value[company.id]) {
        wordcloudInstances.value[company.id].dispose()
      }
      
      const chart = echarts.init(container)
      
      const wordCloudData = company.techStack
        .slice(0, wordCloudMaxWords.value)
        .map(tech => ({
          name: tech.name,
          value: tech.weight * 10
        }))
      
      const option = {
        tooltip: {
          show: true,
          formatter: (params) => {
            return `${params.name}<br/>权重: ${params.data.value / 10}`
          }
        },
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          right: null,
          bottom: null,
          sizeRange: [12, 40],
          rotationRange: [0, 0],
          rotationStep: 45,
          gridSize: 8,
          drawOutOfBound: false,
          layoutAnimation: true,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: () => {
              return company.color
            }
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: wordCloudData
        }]
      }
      
      chart.setOption(option)
      
      // 保存实例引用
      wordcloudInstances.value[company.id] = chart
    })
  })
}

const renderRadarChart = () => {
  if (!radarChart.value) return
  
  if (radarChartInstance) {
    echarts.dispose(radarChartInstance)
  }
  
  radarChartInstance = echarts.init(radarChart.value)
  
  // 获取所有技术
  const allTechsSet = new Set()
  selectedCompanies.value.forEach(company => {
    company.techStack.forEach(tech => {
      allTechsSet.add(tech.name)
    })
  })
  
  const techList = Array.from(allTechsSet).slice(0, 8) // 雷达图最多显示8项技术
  
  const indicator = techList.map(tech => ({
    name: tech,
    max: 10
  }))
  
  const seriesData = selectedCompanies.value.map(company => {
    const values = techList.map(tech => {
      const techItem = company.techStack.find(t => t.name === tech)
      return techItem ? (normalizeRadar.value ? techItem.weight : techItem.weight) : 0
    })
    
    return {
      value: values,
      name: company.name,
      lineStyle: {
        color: company.color
      },
      itemStyle: {
        color: company.color
      },
      areaStyle: {
        color: company.color,
        opacity: 0.1
      }
    }
  })
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: selectedCompanies.value.map(c => c.name),
      textStyle: {
        color: darkMode.value ? '#fff' : '#333'
      }
    },
    radar: {
      indicator: indicator,
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: darkMode.value ? '#aaa' : '#666'
      },
      splitLine: {
        lineStyle: {
          color: darkMode.value ? '#444' : '#ddd'
        }
      },
      splitArea: {
        areaStyle: {
          color: darkMode.value ? ['#222', '#333'] : ['#f8f8f8', '#fff']
        }
      }
    },
    series: [{
      type: 'radar',
      data: seriesData
    }]
  }
  
  radarChartInstance.setOption(option)
}

const renderBarChart = () => {
  if (!barChart.value) return
  
  if (barChartInstance) {
    echarts.dispose(barChartInstance)
  }
  
  barChartInstance = echarts.init(barChart.value)
  
  // 计算技术频率
  const techFrequency = {}
  selectedCompanies.value.forEach(company => {
    company.techStack.forEach(tech => {
      if (!techFrequency[tech.name]) {
        techFrequency[tech.name] = {
          name: tech.name,
          count: 0,
          totalWeight: 0
        }
      }
      techFrequency[tech.name].count++
      techFrequency[tech.name].totalWeight += tech.weight
    })
  })
  
  let techList = Object.values(techFrequency)
  
  // 排序
  if (barSortBy.value === 'frequency') {
    techList.sort((a, b) => b.count - a.count)
  } else {
    techList.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  techList = techList.slice(0, 15) // 最多显示15项技术
  
  const companyNames = selectedCompanies.value.map(c => c.name)
  
  const seriesData = techList.map(tech => {
    const data = selectedCompanies.value.map(company => {
      const techItem = company.techStack.find(t => t.name === tech.name)
      return techItem ? techItem.weight : 0
    })
    
    return {
      name: tech.name,
      type: 'bar',
      stack: 'tech',
      data: data,
      emphasis: {
        focus: 'series'
      }
    }
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: techList.map(t => t.name),
      textStyle: {
        color: darkMode.value ? '#fff' : '#333'
      },
      type: 'scroll',
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: companyNames,
      axisLabel: {
        color: darkMode.value ? '#fff' : '#333'
      }
    },
    yAxis: {
      type: 'value',
      name: '权重',
      axisLabel: {
        color: darkMode.value ? '#fff' : '#333'
      }
    },
    series: seriesData
  }
  
  barChartInstance.setOption(option)
}

const renderHeatmap = () => {
  if (!heatmapChart.value) return
  
  if (heatmapChartInstance) {
    echarts.dispose(heatmapChartInstance)
  }
  
  heatmapChartInstance = echarts.init(heatmapChart.value)
  
  const companyNames = selectedCompanies.value.map(c => c.name)
  
  // 获取所有技术
  const allTechsSet = new Set()
  selectedCompanies.value.forEach(company => {
    company.techStack.forEach(tech => {
      allTechsSet.add(tech.name)
    })
  })
  
  let techList = Array.from(allTechsSet)
  
  // 如果启用聚类，对技术和公司进行排序
  if (clusterHeatmap.value) {
    // 简化的聚类：按技术出现频率排序
    const techFrequency = {}
    selectedCompanies.value.forEach(company => {
      company.techStack.forEach(tech => {
        techFrequency[tech.name] = (techFrequency[tech.name] || 0) + 1
      })
    })
    
    techList.sort((a, b) => techFrequency[b] - techFrequency[a])
  }
  
  techList = techList.slice(0, 20) // 最多显示20项技术
  
  const data = []
  selectedCompanies.value.forEach((company, companyIndex) => {
    techList.forEach((tech, techIndex) => {
      const techItem = company.techStack.find(t => t.name === tech)
      if (techItem) {
        data.push([companyIndex, techIndex, techItem.weight])
      }
    })
  })
  
  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${companyNames[params.data[0]]} - ${techList[params.data[1]]}<br/>权重: ${params.data[2]}`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: companyNames,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: darkMode.value ? '#fff' : '#333',
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: techList,
      splitArea: {
        show: true
      },
      axisLabel: {
        color: darkMode.value ? '#fff' : '#333'
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      textStyle: {
        color: darkMode.value ? '#fff' : '#333'
      },
      inRange: {
        color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
      }
    },
    series: [{
      name: '技术权重',
      type: 'heatmap',
      data: data,
      label: {
        show: true,
        formatter: (params) => {
          return params.data[2] > 0 ? params.data[2] : ''
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  heatmapChartInstance.setOption(option)
}

// 监听器
watch([selectedCompanyIds, techFilter, wordCloudMaxWords], () => {
  if (currentView.value === 'wordcloud') {
    renderWordClouds()
  }
}, { deep: true })

watch([selectedCompanyIds, techFilter, normalizeRadar], () => {
  if (currentView.value === 'radar') {
    renderRadarChart()
  }
}, { deep: true })

watch([selectedCompanyIds, techFilter, barSortBy], () => {
  if (currentView.value === 'bar') {
    renderBarChart()
  }
}, { deep: true })

watch([selectedCompanyIds, techFilter, clusterHeatmap], () => {
  if (currentView.value === 'distribution') {
    renderHeatmap()
  }
}, { deep: true })

watch(currentView, (newView) => {
  // 延迟渲染以确保DOM已更新
  setTimeout(() => {
    switch (newView) {
      case 'wordcloud':
        renderWordClouds()
        break
      case 'radar':
        renderRadarChart()
        break
      case 'bar':
        renderBarChart()
        break
      case 'distribution':
        renderHeatmap()
        break
      // table视图不需要图表渲染
    }
  }, 100)
})

watch(darkMode, () => {
  // 重新渲染所有图表以适应主题变化
  switch (currentView.value) {
    case 'wordcloud':
      renderWordClouds()
      break
    case 'radar':
      renderRadarChart()
      break
    case 'bar':
      renderBarChart()
      break
    case 'distribution':
      renderHeatmap()
      break
  }
})

// 生命周期
onMounted(() => {
  // 初始渲染
  renderWordClouds()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理ECharts实例
  Object.values(wordcloudInstances.value).forEach(instance => {
    if (instance) {
      instance.dispose()
    }
  })
  
  if (radarChartInstance) {
    echarts.dispose(radarChartInstance)
  }
  
  if (barChartInstance) {
    echarts.dispose(barChartInstance)
  }
  
  if (heatmapChartInstance) {
    echarts.dispose(heatmapChartInstance)
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  // 重新调整图表大小
  Object.values(wordcloudInstances.value).forEach(instance => {
    if (instance) {
      instance.resize()
    }
  })
  
  if (radarChartInstance) {
    radarChartInstance.resize()
  }
  
  if (barChartInstance) {
    barChartInstance.resize()
  }
  
  if (heatmapChartInstance) {
    heatmapChartInstance.resize()
  }
}
</script>

<style scoped>
.tech-stack-visualization {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  transition: background 0.3s ease;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

[data-theme="dark"] .tech-stack-visualization {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #f0f0f0;
}

.app-header {
  text-align: center;
  padding: 2rem 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .app-header {
  background: rgba(30, 30, 46, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.app-header h1 {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(90deg, #FF6A00, #FF0000, #2932E1, #07C160);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

[data-theme="dark"] .app-header h1 {
  background: linear-gradient(90deg, #ff9a4d, #ff6666, #8a8fff, #5ef7a5);
  -webkit-background-clip: text;
  background-clip: text;
}

.subtitle {
  margin-top: 0.5rem;
  color: #666;
  font-size: 1rem;
}

[data-theme="dark"] .subtitle {
  color: #aaa;
}

.main-content {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  gap: 1.5rem;
  min-height: calc(100vh - 180px);
}

.control-panel {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

[data-theme="dark"] .section-card {
  background: #252540;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.section-card h3 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

[data-theme="dark"] .section-card h3 {
  color: #f0f0f0;
}

.icon {
  font-style: normal;
}

.selected-companies {
  margin-bottom: 1.2rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.tag-remove {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
  padding: 0;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.5);
}

.selected-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

[data-theme="dark"] .selected-count {
  color: #aaa;
}

.clear-btn {
  background: none;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #ff6b6b;
  color: white;
}

.company-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.company-list::-webkit-scrollbar {
  width: 6px;
}

.company-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

[data-theme="dark"] .company-list::-webkit-scrollbar-track {
  background: #333;
}

.company-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

[data-theme="dark"] .company-list::-webkit-scrollbar-thumb {
  background: #555;
}

.company-item {
  display: flex;
  align-items: center;
  padding: 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 0.5rem;
}

.company-item:hover {
  background: #f5f7ff;
}

[data-theme="dark"] .company-item:hover {
  background: #2a2a4a;
}

.company-item.selected {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #667eea;
}

.company-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.company-name {
  font-weight: 500;
  color: #333;
}

[data-theme="dark"] .company-name {
  color: #f0f0f0;
}

.tech-count {
  font-size: 0.8rem;
  color: #666;
  background: #f0f0f0;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
}

[data-theme="dark"] .tech-count {
  color: #aaa;
  background: #333;
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #f9f9f9;
  transition: all 0.2s;
}

[data-theme="dark"] .search-input {
  background: #333;
  border-color: #555;
  color: #f0f0f0;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.tech-filter {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  background: #f0f5ff;
  border: 1px solid #d1ddff;
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

[data-theme="dark"] .tech-tag {
  background: #2a2a4a;
  border-color: #444;
}

.tech-tag:hover {
  background: #e1e9ff;
  transform: translateY(-1px);
}

[data-theme="dark"] .tech-tag:hover {
  background: #3a3a5a;
}

.tech-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.tech-tag .tech-count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
}

.view-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: left;
  transition: all 0.2s;
}

[data-theme="dark"] .view-btn {
  background: #2a2a4a;
  border-color: #444;
  color: #f0f0f0;
}

.view-btn:hover {
  background: #e9ecef;
  transform: translateX(3px);
}

[data-theme="dark"] .view-btn:hover {
  background: #3a3a5a;
}

.view-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: linear-gradient(135deg, #6a89cc 0%, #4a69bd 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(106, 137, 204, 0.3);
}

.visualization-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-header {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .view-header {
  background: #252540;
}

.view-header h2 {
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

[data-theme="dark"] .view-header h2 {
  color: #f0f0f0;
}

.view-subtitle {
  font-size: 1rem;
  color: #666;
  font-weight: normal;
}

[data-theme="dark"] .view-subtitle {
  color: #aaa;
}

.view-description {
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.95rem;
}

[data-theme="dark"] .view-description {
  color: #aaa;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .empty-state {
  background: #252540;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  margin: 0 0 0.8rem;
  font-size: 1.5rem;
  color: #333;
}

[data-theme="dark"] .empty-state h3 {
  color: #f0f0f0;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
  max-width: 500px;
}

[data-theme="dark"] .empty-state p {
  color: #aaa;
}

.sample-hint {
  background: #f8f9ff;
  padding: 1rem;
  border-radius: 10px;
  color: #555;
}

[data-theme="dark"] .sample-hint {
  background: #2a2a4a;
  color: #ccc;
}

.sample-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  transition: all 0.2s;
}

.sample-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.visualization-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
}

[data-theme="dark"] .visualization-container {
  background: #252540;
}

.chart-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

[data-theme="dark"] .chart-header h3 {
  color: #f0f0f0;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
}

.chart-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

[data-theme="dark"] .chart-controls label {
  color: #aaa;
}

.range-slider {
  width: 100px;
}

.select-control {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
}

[data-theme="dark"] .select-control {
  background: #333;
  border-color: #555;
  color: #f0f0f0;
}

.wordclouds-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  overflow-y: auto;
  padding: 0.5rem;
}

.wordcloud-card {
  background: #f9faff;
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e6eeff;
}

[data-theme="dark"] .wordcloud-card {
  background: #2a2a4a;
  border-color: #444;
}

.wordcloud-card h4 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #333;
  text-align: center;
}

[data-theme="dark"] .wordcloud-card h4 {
  color: #f0f0f0;
}

.wordcloud {
  height: 250px;
  width: 100%;
}

.radar-chart-container, .bar-chart-container, .heatmap-container {
  flex: 1;
  min-height: 400px;
}

.radar-chart, .bar-chart, .heatmap-chart {
  width: 100%;
  height: 100%;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

[data-theme="dark"] .table-header h3 {
  color: #f0f0f0;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.export-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

[data-theme="dark"] .table-wrapper {
  border-color: #444;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.comparison-table th {
  background: #f8f9fa;
  padding: 0.8rem 0.5rem;
  font-weight: 600;
  color: #495057;
  text-align: center;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

[data-theme="dark"] .comparison-table th {
  background: #2a2a4a;
  color: #f0f0f0;
  border-bottom-color: #444;
}

.comparison-table td {
  padding: 0.6rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
  transition: background 0.2s;
}

[data-theme="dark"] .comparison-table td {
  border-bottom-color: #444;
}

.comparison-table tr:hover td {
  background: #f8f9ff;
}

[data-theme="dark"] .comparison-table tr:hover td {
  background: #2a2a5a;
}

.sticky-header, .sticky-cell {
  position: sticky;
  left: 0;
  z-index: 5;
  background: white;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .sticky-header, 
[data-theme="dark"] .sticky-cell {
  background: #252540;
}

.company-cell {
  font-weight: 600;
  color: #333;
  text-align: left;
  padding-left: 1rem;
  min-width: 120px;
}

[data-theme="dark"] .company-cell {
  color: #f0f0f0;
}

.has-tech {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(46, 125, 50, 0.1) 100%);
}

.tech-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tech-icon {
  font-size: 0.9rem;
}

.tech-weight {
  background: rgba(76, 175, 80, 0.2);
  color: #2E7D32;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

[data-theme="dark"] .tech-weight {
  background: rgba(76, 175, 80, 0.3);
  color: #81c784;
}

.no-tech {
  color: #ccc;
}

[data-theme="dark"] .no-tech {
  color: #666;
}

.highlight-tech {
  background: rgba(255, 193, 7, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .app-footer {
  background: rgba(30, 30, 46, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content p {
  margin: 0.3rem 0;
  color: #666;
  font-size: 0.9rem;
}

[data-theme="dark"] .footer-content p {
  color: #aaa;
}

.footer-note {
  font-size: 0.8rem;
  color: #888;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .control-panel {
    flex: 0 0 auto;
    width: 100%;
  }
  
  .company-list {
    max-height: 200px;
  }
  
  .wordclouds-container {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.8rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .wordclouds-container {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>