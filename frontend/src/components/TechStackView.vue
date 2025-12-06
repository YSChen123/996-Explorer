<template>
  <div class="tech-stack-visualization">
    <header class="app-header">
      <h1><i class="icon">💻</i> 技术栈可视化分析系统</h1>
      <p class="subtitle">分析国内科技公司的技术栈与技能关键词分布</p>
    </header>

    <main class="main-content">
      <section class="control-panel">
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

      <section class="visualization-area">
        <div class="view-header">
          <h2>
            <i class="icon">{{ currentViewConfig.icon }}</i>
            {{ currentViewConfig.name }}
            <span v-if="selectedCompanies.length > 0 && currentView !== 'skilltree'" class="view-subtitle">
              - 分析 {{ selectedCompanies.length }} 家公司
            </span>
          </h2>
          <div class="view-description">{{ currentViewConfig.description }}</div>
        </div>

        <div v-if="selectedCompanies.length === 0 && currentView !== 'skilltree'" class="empty-state">
          <div class="empty-icon">👆</div>
          <h3>请选择至少一家公司</h3>
          <p>从左侧面板选择您想要分析的公司，系统将自动生成可视化图表</p>
          <div class="sample-hint">
            提示：您可以尝试选择
            <button @click="selectSampleCompanies" class="sample-btn">示例公司组</button>
            快速体验
          </div>
        </div>

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

        <div v-else-if="currentView === 'skilltree'" class="visualization-container skill-galaxy-view">
          <div class="galaxy-wrapper" ref="galaxyChartRef">
            <svg ref="svgRef" @click="bgClick" class="galaxy-svg"></svg>
            <div class="galaxy-controls-overlay">
              <span class="hint-text">💡 拖拽节点 / 滚轮缩放 / 点击查看详情</span>
            </div>
          </div>

          <transition name="slide-fade">
            <div v-if="selectedNode" class="info-panel">
              <div class="panel-bg-glow" :style="{ background: getNodeColor(selectedNode) }"></div>
              <div class="panel-content">
                <div class="panel-header">
                  <div class="panel-icon-svg" :style="{ borderColor: getNodeColor(selectedNode), color: getNodeColor(selectedNode) }">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path :d="iconPaths[selectedNode.data.iconType] || iconPaths['default']" />
                    </svg>
                  </div>
                  <div class="panel-title-area">
                    <div class="panel-title">{{ selectedNode.data.name }}</div>
                    <div class="panel-tag" :style="{ borderColor: getNodeColor(selectedNode), color: getNodeColor(selectedNode) }">
                      {{ selectedNode.depth === 0 ? '核心' : (selectedNode.depth === 1 ? '岗位' : '技术栈') }}
                    </div>
                  </div>
                  <button class="close-btn" @click="clearSelectionSkill">×</button>
                </div>
                
                <div class="panel-body">
                  <div class="section-title">技术描述</div>
                  <p class="desc-text">{{ selectedNode.data.desc || '暂无详细描述信息...' }}</p>
                  
                  <div class="stat-group" v-if="selectedNode.depth > 1">
                    <div class="stat-row">
                      <span class="stat-label">🔥 市场热度</span>
                      <div class="progress-bar">
                        <div class="progress-fill" 
                             :style="{ 
                               width: Math.min(100, selectedNode.data.value) + '%', 
                               background: `linear-gradient(90deg, #ef4444, #fee2e2)` 
                             }">
                        </div>
                      </div>
                    </div>

                    <div class="stat-row">
                      <div class="stat-label-row">
                        <span class="stat-label">🧠 个人掌握</span>
                        <span class="stat-score" :class="{ 'score-high': (selectedNode.data.userMastery || 0) >= 80 }">
                          {{ selectedNode.data.userMastery || 0 }}%
                        </span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" 
                             :style="{ 
                               width: (selectedNode.data.userMastery || 0) + '%', 
                               background: `linear-gradient(90deg, #22c55e, #dcfce7)` 
                             }">
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="quiz-section" v-if="selectedNode.data.quiz && selectedNode.data.quiz.length">
                    <div class="sub-title">📝 技能自测</div>
                    
                    <div v-if="!quizState.isTesting" class="quiz-start-view">
                      <p class="quiz-intro">
                        共 {{ selectedNode.data.quiz.length }} 道题。
                        <span v-if="selectedNode.data.userMastery > 0">当前成绩：{{ selectedNode.data.userMastery }}分。</span>
                      </p>
                      <button class="btn-primary" @click="startQuiz(selectedNode.data.quiz)">
                        {{ selectedNode.data.userMastery > 0 ? '重新测试' : '开始测试' }}
                      </button>
                    </div>

                    <div v-else class="quiz-testing-view">
                      <div v-for="(q, idx) in quizState.currentQuestions" :key="idx" class="quiz-item">
                        <div class="quiz-question">{{ idx + 1 }}. {{ q.question }}</div>
                        <div class="quiz-options">
                          <label 
                            v-for="(opt, oIdx) in q.options" 
                            :key="oIdx" 
                            class="quiz-option-label"
                            :class="{ 'selected': quizState.answers[idx] === oIdx }"
                          >
                            <input 
                              type="radio" 
                              :name="'q-' + idx" 
                              :value="oIdx" 
                              v-model="quizState.answers[idx]" 
                            >
                            {{ opt }}
                          </label>
                        </div>
                      </div>
                      <div class="quiz-actions">
                        <button class="btn-secondary" @click="cancelQuiz">取消</button>
                        <button class="btn-primary" @click="submitQuiz">提交答案</button>
                      </div>
                    </div>
                  </div>

                  <div class="related-skills" v-if="selectedNode.data.highlights && selectedNode.data.highlights.length">
                    <div class="sub-title">📌 核心知识点</div>
                    <div class="tags">
                      <span 
                        v-for="(tag, index) in selectedNode.data.highlights" 
                        :key="index" 
                        class="skill-tag highlight-tag clickable"
                        @click.stop="handleHighlightClick(tag)"
                      >
                        {{ typeof tag === 'object' ? tag.name : tag }} 
                        <span class="link-icon">↗</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

      </section>
    </main>

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
import { ref, computed, watch, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import * as d3 from 'd3' // 引入 D3 用于技能树

// ==========================================
// 1. 数据部分 (完全保留原 TechStackView 数据)
// ==========================================

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

// ==========================================
// 2. 技能树数据与配置 (新增)
// ==========================================

const treeData = {
  name: "Tech Stack",
  group: "Root",
  desc: "全栈技术图谱总览，包含后端、AI及工程化能力。",
  children: [
    {
      name: "后端架构",
      group: "Role",
      iconType: "user",
      desc: "负责设计高并发、高可用的分布式系统，处理海量请求与数据一致性。",
      highlights: ["系统设计", "性能优化", "微服务治理"],
      children: [
        {
          name: "底层原理",
          group: "底层原理与架构",
          iconType: "code",
          desc: "深入理解计算机系统运作机制。",
          children: [
            { 
              name: "OS内核", value: 90, group: "底层原理与架构", iconType: "os", 
              desc: "Linux内核机制、进程调度与内存管理。", 
              highlights: ["CFS调度", "PageCache", "VFS", "中断处理"],
              userMastery: 0,
              quiz: [
                { question: "Linux中哪个命令用于查看系统负载？", options: ["top", "ls", "cp", "netstat"], correct: 0 },
                { question: "PageCache 主要利用了哪种物理资源？", options: ["CPU", "RAM", "HDD", "GPU"], correct: 1 }
              ]
            },
            { 
              name: "网络协议", value: 85, group: "底层原理与架构", iconType: "server", 
              desc: "TCP/IP 协议栈深入理解。", 
              highlights: ["TCP拥塞控制", "HTTP2/3", "QUIC", "BGP"],
              userMastery: 0,
              quiz: [
                { question: "TCP 三次握手发生在哪个阶段？", options: ["传输数据时", "建立连接时", "断开连接时"], correct: 1 },
                { question: "HTTP/3 基于哪个协议？", options: ["TCP", "UDP", "SCTP"], correct: 1 }
              ]
            },
            { 
              name: "分布式", value: 80, group: "底层原理与架构", iconType: "cloud", 
              desc: "解决分布式环境下的共识与一致性问题。", 
              highlights: [{ name: "Paxos算法", url: "https://zh.wikipedia.org/wiki/Paxos算法" }, "Raft", "ZAB", "CAP定理"],
              userMastery: 0,
              quiz: [
                { question: "在CAP定理中，P代表什么？", options: ["Consistency", "Availability", "Partition tolerance"], correct: 2 },
                { question: "Raft协议中，Leader的作用是？", options: ["只读", "处理所有客户端请求", "备份日志"], correct: 1 }
              ]
            }
          ]
        },
        {
          name: "Java生态",
          group: "Java生态",
          iconType: "server",
          desc: "企业级应用开发核心技术栈。",
          children: [
            { 
              name: "JVM", value: 100, group: "Java生态", iconType: "code", 
              desc: "Java虚拟机深入调优。", 
              highlights: ["GC算法", "JIT编译", "类加载", "内存模型JMM"],
              userMastery: 0,
              quiz: [
                { question: "JVM中哪个区域是线程私有的？", options: ["堆", "方法区", "虚拟机栈"], correct: 2 },
                { question: "G1 收集器属于哪种垃圾回收器？", options: ["串行", "并行", "并发"], correct: 2 }
              ]
            },
            { 
              name: "Spring", value: 95, group: "Java生态", iconType: "server", 
              desc: "Spring 全家桶应用与原理。", 
              highlights: [{ name: "Spring官网", url: "https://spring.io/" }, "IOC/AOP", "Spring Boot"],
              userMastery: 0,
              quiz: [
                { question: "Spring默认的Bean作用域是？", options: ["Prototype", "Singleton", "Request"], correct: 1 }
              ]
            },
            { 
              name: "Netty", value: 80, group: "Java生态", iconType: "network", 
              desc: "高性能异步事件驱动网络框架。", 
              highlights: ["Reactor模型", "零拷贝", "ByteBuf", "ChannelPipeline"],
              userMastery: 0,
              quiz: [
                { question: "Netty 的核心线程模型是？", options: ["Reactor", "Proactor", "Actor"], correct: 0 }
              ]
            }
          ]
        },
        {
          name: "存储系统",
          group: "数据库与大数据",
          iconType: "database",
          desc: "数据持久化与高速缓存方案。",
          children: [
            { 
              name: "MySQL", value: 95, group: "数据库与大数据", iconType: "database", 
              desc: "关系型数据库核心。", 
              highlights: ["InnoDB引擎", "B+树索引", "MVCC", "事务隔离"],
              userMastery: 0,
              quiz: [
                { question: "InnoDB 使用哪种数据结构实现索引？", options: ["红黑树", "Hash", "B+树"], correct: 2 },
                { question: "MVCC 用于解决什么问题？", options: ["读写冲突", "磁盘IO", "内存溢出"], correct: 0 }
              ]
            },
            { 
              name: "Redis", value: 90, group: "数据库与大数据", iconType: "database", 
              desc: "内存数据库与缓存。", 
              highlights: ["持久化RDB/AOF", "Redis Cluster", "缓存击穿", "跳表"],
              userMastery: 0,
              quiz: [
                { question: "Redis 默认端口是？", options: ["3306", "6379", "8080"], correct: 1 },
                { question: "ZSet 底层使用了什么数据结构？", options: ["链表", "跳表", "数组"], correct: 1 }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "AI & Data",
      group: "Role",
      iconType: "ai",
      desc: "利用数据挖掘价值，构建智能应用。",
      children: [
        {
          name: "AI Core",
          group: "人工智能与Python",
          iconType: "ai",
          desc: "人工智能核心算法与框架。",
          children: [
            { name: "Python", value: 95, group: "人工智能与Python", iconType: "code", desc: "AI 开发首选语言。", highlights: ["GIL", "Decorator"], userMastery: 0, quiz: [] },
            { name: "PyTorch", value: 85, group: "人工智能与Python", iconType: "ai", desc: "深度学习动态图框架。", highlights: ["Autograd", "DDP"], userMastery: 0, quiz: [] }
          ]
        }
      ]
    },
    {
      name: "工程化",
      group: "Role",
      iconType: "tool",
      desc: "提升研发效率与交付质量。",
      children: [
        {
          name: "Web前端",
          group: "前端与移动端",
          iconType: "mobile",
          desc: "现代前端交互开发。",
          children: [
            { 
              name: "Vue3", value: 75, group: "前端与移动端", iconType: "code", 
              desc: "渐进式 JavaScript 框架。", 
              highlights: ["Composition API", "Proxy响应式"], 
              userMastery: 0,
              quiz: [
                { question: "Vue3 使用什么实现响应式？", options: ["Object.defineProperty", "Proxy", "Observer"], correct: 1 }
              ]
            },
            { name: "React", value: 70, group: "前端与移动端", iconType: "code", desc: "构建用户界面的库。", highlights: ["Fiber", "Hooks"], userMastery: 0, quiz: [] }
          ]
        }
      ]
    }
  ]
};

const iconPaths = {
  'user': 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  'code': 'M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z', 
  'database': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
  'server': 'M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z',
  'cloud': 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z',
  'ai': 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm5.17 11.83c-.85 2.16-3.24 3.17-5.17 3.17-1.93 0-4.32-1-5.17-3.17-.42-1.08.3-2.17 1.47-2.17h7.4c1.17 0 1.89 1.09 1.47 2.17z',
  'tool': 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  'mobile': 'M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z',
  'os': 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H9v-2h6v2zm-3-7l-3-3 3-3 1.41 1.41L11.83 11l1.59 1.59L12 14z',
  'default': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'
};

const groupColors = {
  "Root": "#334155", 
  "Role": "#3b82f6", 
  "底层原理与架构": "#db2777", 
  "C/C++与系统": "#ea580c", 
  "Java生态": "#4f46e5", 
  "数据库与大数据": "#059669", 
  "人工智能与Python": "#7c3aed", 
  "前端与移动端": "#be185d", 
  "计算机基础与工程": "#d97706"
};

// ==========================================
// 3. 状态变量 (State)
// ==========================================

const selectedCompanyIds = ref([1, 2, 3, 4])
const techFilter = ref('')
const currentView = ref('wordcloud')
const darkMode = ref(false)

// 图表配置
const wordCloudMaxWords = ref(30)
const normalizeRadar = ref(true)
const barSortBy = ref('frequency')
const tableShowWeights = ref(false)
const clusterHeatmap = ref(false)

// 视图配置 (增加了 skilltree)
const views = ref([
  { id: 'wordcloud', name: '技术词云', icon: '☁️', description: '每家公司技术栈的词云展示，字体大小表示技术权重' },
  { id: 'skilltree', name: '技能星系', icon: '🌌', description: '交互式全栈技术图谱，探索技术掌握路径与知识点' },
  { id: 'radar', name: '雷达图', icon: '📈', description: '各公司技术栈雷达对比图，展示技术覆盖面' },
  { id: 'bar', name: '条形图', icon: '📊', description: '技术出现频率条形图，对比各公司技术使用情况' },
  { id: 'table', name: '对照表', icon: '📋', description: '公司×技术栈详细对照表，显示具体技术权重' },
  { id: 'distribution', name: '分布图', icon: '🔥', description: '技术分布热力图，展示技术在各公司的分布情况' }
])

// ECharts实例引用
const wordcloudInstances = ref({})
const radarChart = ref(null)
const barChart = ref(null)
const heatmapChart = ref(null)
let radarChartInstance = null
let barChartInstance = null
let heatmapChartInstance = null

// D3 技能树状态
const galaxyChartRef = ref(null);
const svgRef = ref(null);
const selectedNode = ref(null);
let simulation = null;
const quizState = reactive({
  isTesting: false,
  currentQuestions: [],
  answers: {}
});

// ==========================================
// 4. 计算属性 (Computed)
// ==========================================

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
  result.sort((a, b) => b.count - a.count)
  
  if (techFilter.value) {
    result = result.filter(tech => 
      tech.name.toLowerCase().includes(techFilter.value.toLowerCase())
    )
  }
  
  return result.slice(0, 20)
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

// ==========================================
// 5. 方法 (Methods)
// ==========================================

// --- 通用交互 ---
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
  
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `tech-comparison-${new Date().toISOString().slice(0,10)}.csv`)
  link.click()
}

// --- 技能星系 (D3 Logic) ---

const getNodeColor = (d) => groupColors[d.data?.group] || groupColors[d.group] || "#94a3b8";

const handleHighlightClick = (tag) => {
  let url = '';
  if (typeof tag === 'object' && tag.url) {
    url = tag.url;
  } else {
    const keyword = typeof tag === 'object' ? tag.name : tag;
    url = `https://www.google.com/search?q=${encodeURIComponent(keyword + ' 技术原理')}`;
  }
  window.open(url, '_blank');
};

const startQuiz = (questions) => {
  quizState.currentQuestions = questions;
  quizState.answers = {};
  quizState.isTesting = true;
};
const cancelQuiz = () => {
  quizState.isTesting = false;
  quizState.currentQuestions = [];
};
const submitQuiz = () => {
  if (!selectedNode.value) return;
  const questions = quizState.currentQuestions;
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (quizState.answers[idx] === q.correct) correctCount++;
  });
  const score = Math.round((correctCount / questions.length) * 100);
  selectedNode.value.data.userMastery = score;
  alert(`测试完成！得分：${score} 分`);
  quizState.isTesting = false;
};

const selectNode = (d) => { selectedNode.value = d; cancelQuiz(); };
const clearSelectionSkill = () => { selectedNode.value = null; };
const bgClick = (e) => {
  if (e.target.tagName === 'svg' || e.target.tagName === 'rect') clearSelectionSkill();
};

const initGalaxyChart = () => {
  if (!svgRef.value) return;
  const width = galaxyChartRef.value ? galaxyChartRef.value.clientWidth : 800;
  const height = galaxyChartRef.value ? galaxyChartRef.value.clientHeight : 600;
  
  if (simulation) simulation.stop();
  const svg = d3.select(svgRef.value);
  svg.selectAll('*').remove(); 

  svg.attr('width', width).attr('height', height)
     .attr('viewBox', [-width/2, -height/2, width, height]);

  svg.append("rect")
     .attr("width", width * 4).attr("height", height * 4)
     .attr("x", -width * 2).attr("y", -height * 2)
     .attr("fill", "transparent")
     .on("click", bgClick);

  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "glow");
  glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
  const feMerge = glow.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  const container = svg.append('g');
  const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', (e) => container.attr('transform', e.transform));
  svg.call(zoom);

  const root = d3.hierarchy(treeData);
  const nodes = root.descendants();
  const links = root.links();
  nodes.forEach((d, i) => { d.id = "node-" + i; });
  d3.tree().size([height * 0.8, width * 0.6])(root);
  nodes.forEach(d => { const temp = d.x; d.x = d.y - width/4; d.y = temp - height/4; });

  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100).strength(1))
    .force("charge", d3.forceManyBody().strength(-600))
    .force("collide", d3.forceCollide().radius(45))
    .force("x", d3.forceX(d => (d.depth - 1) * 250).strength(0.35))
    .force("y", d3.forceY(0).strength(0.08));

  const link = container.append("g").selectAll("path").data(links).join("path")
    .attr("fill", "none").attr("stroke-width", 1.5).attr("stroke-opacity", 0.4).attr("stroke", "#94a3b8").style("pointer-events", "none");

  const node = container.append("g").selectAll("g").data(nodes).join("g")
    .attr("class", "node").style("cursor", "grab")
    .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
    .on("click", (e, d) => { e.stopPropagation(); selectNode(d); });

  node.each(function(d) {
    const el = d3.select(this);
    const color = getNodeColor(d);
    el.append("circle").attr("r", d.depth === 0 ? 0 : (38 - d.depth * 5)).attr("fill", color).attr("fill-opacity", 0.1).attr("class", "pulse-circle");
    el.append("circle").attr("r", d.depth === 0 ? 0 : (16 - d.depth * 2)).attr("fill", "#ffffff").attr("stroke", color).attr("stroke-width", 2).attr("filter", "url(#glow)");
    if (d.depth > 0 && d.depth < 3) {
      const scale = d.depth === 1 ? 0.7 : 0.5;
      el.append("path").attr("d", iconPaths[d.data.iconType] || iconPaths['default']).attr("fill", color).attr("transform", `translate(${-12 * scale}, ${-12 * scale}) scale(${scale})`).style("pointer-events", "none");
    }
    el.append("text").text(d.data.name).attr("dy", d.depth === 1 ? 40 : 32).attr("text-anchor", "middle").attr("fill", darkMode.value ? "#ccc" : "#334155").style("font-size", d.depth === 1 ? "14px" : "12px").style("font-weight", d.depth === 1 ? "bold" : "normal").style("pointer-events", "none");
  });

  simulation.on("tick", () => {
    link.attr("d", d => {
      const sourceX = d.source.x, sourceY = d.source.y;
      const targetX = d.target.x, targetY = d.target.y;
      return `M${sourceX},${sourceY}C${(sourceX + targetX) / 2},${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`;
    }).attr("stroke", d => getNodeColor(d.target));
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; d3.select(this).style("cursor", "grabbing"); }
  function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
  function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; d3.select(this).style("cursor", "grab"); }
};

// ==========================================
// 6. 图表渲染 (ECharts)
// ==========================================

const renderWordClouds = () => {
  nextTick(() => {
    Object.keys(wordcloudInstances.value).forEach(companyId => {
      if (!selectedCompanyIds.value.includes(parseInt(companyId))) {
        if (wordcloudInstances.value[companyId]) wordcloudInstances.value[companyId].dispose()
        delete wordcloudInstances.value[companyId]
      }
    })
    
    selectedCompanies.value.forEach((company) => {
      const containerId = `wordcloud-${company.id}`
      const container = document.getElementById(containerId)
      if (!container) return
      
      if (wordcloudInstances.value[company.id]) wordcloudInstances.value[company.id].dispose()
      
      const chart = echarts.init(container)
      const wordCloudData = company.techStack.slice(0, wordCloudMaxWords.value).map(tech => ({
        name: tech.name, value: tech.weight * 10
      }))
      
      const option = {
        tooltip: { show: true, formatter: (p) => `${p.name}<br/>权重: ${p.data.value / 10}` },
        series: [{
          type: 'wordCloud', shape: 'circle',
          sizeRange: [12, 40], rotationRange: [0, 0],
          textStyle: { fontFamily: 'sans-serif', fontWeight: 'bold', color: () => company.color },
          data: wordCloudData
        }]
      }
      chart.setOption(option)
      wordcloudInstances.value[company.id] = chart
    })
  })
}

const renderRadarChart = () => {
  if (!radarChart.value) return
  if (radarChartInstance) echarts.dispose(radarChartInstance)
  
  radarChartInstance = echarts.init(radarChart.value)
  const allTechsSet = new Set()
  selectedCompanies.value.forEach(c => c.techStack.forEach(t => allTechsSet.add(t.name)))
  const techList = Array.from(allTechsSet).slice(0, 8)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { data: selectedCompanies.value.map(c => c.name), textStyle: { color: darkMode.value ? '#fff' : '#333' } },
    radar: {
      indicator: techList.map(t => ({ name: t, max: 10 })),
      axisName: { color: darkMode.value ? '#aaa' : '#666' }
    },
    series: [{
      type: 'radar',
      data: selectedCompanies.value.map(c => ({
        value: techList.map(tech => {
          const t = c.techStack.find(item => item.name === tech)
          return t ? t.weight : 0
        }),
        name: c.name,
        itemStyle: { color: c.color },
        lineStyle: { color: c.color },
        areaStyle: { color: c.color, opacity: 0.1 }
      }))
    }]
  }
  radarChartInstance.setOption(option)
}

const renderBarChart = () => {
  if (!barChart.value) return
  if (barChartInstance) echarts.dispose(barChartInstance)
  
  barChartInstance = echarts.init(barChart.value)
  const techFrequency = {}
  selectedCompanies.value.forEach(c => c.techStack.forEach(t => {
    if (!techFrequency[t.name]) techFrequency[t.name] = { name: t.name, count: 0 }
    techFrequency[t.name].count++
  }))
  
  let techList = Object.values(techFrequency)
  if (barSortBy.value === 'frequency') techList.sort((a, b) => b.count - a.count)
  else techList.sort((a, b) => a.name.localeCompare(b.name))
  techList = techList.slice(0, 15)
  
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { textStyle: { color: darkMode.value ? '#fff' : '#333' } },
    xAxis: { type: 'category', data: selectedCompanies.value.map(c => c.name), axisLabel: { color: darkMode.value ? '#fff' : '#333' } },
    yAxis: { type: 'value', axisLabel: { color: darkMode.value ? '#fff' : '#333' } },
    series: techList.map(tech => ({
      name: tech.name, type: 'bar', stack: 'tech',
      data: selectedCompanies.value.map(c => {
        const t = c.techStack.find(item => item.name === tech.name)
        return t ? t.weight : 0
      })
    }))
  }
  barChartInstance.setOption(option)
}

const renderHeatmap = () => {
  if (!heatmapChart.value) return
  if (heatmapChartInstance) echarts.dispose(heatmapChartInstance)
  
  heatmapChartInstance = echarts.init(heatmapChart.value)
  const companyNames = selectedCompanies.value.map(c => c.name)
  const allTechsSet = new Set()
  selectedCompanies.value.forEach(c => c.techStack.forEach(t => allTechsSet.add(t.name)))
  let techList = Array.from(allTechsSet).slice(0, 20)
  
  if (clusterHeatmap.value) {
    const freq = {}
    selectedCompanies.value.forEach(c => c.techStack.forEach(t => freq[t.name] = (freq[t.name] || 0) + 1))
    techList.sort((a, b) => freq[b] - freq[a])
  }
  
  const data = []
  selectedCompanies.value.forEach((c, cIdx) => {
    techList.forEach((t, tIdx) => {
      const item = c.techStack.find(i => i.name === t)
      if (item) data.push([cIdx, tIdx, item.weight])
    })
  })
  
  const option = {
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: companyNames, axisLabel: { color: darkMode.value ? '#fff' : '#333', rotate: 45 } },
    yAxis: { type: 'category', data: techList, axisLabel: { color: darkMode.value ? '#fff' : '#333' } },
    visualMap: { min: 0, max: 10, calculable: true, orient: 'horizontal', bottom: 0, inRange: { color: ['#e0f3f8', '#313695'] } },
    series: [{ type: 'heatmap', data: data, label: { show: true } }]
  }
  heatmapChartInstance.setOption(option)
}

// ==========================================
// 7. 监听器与生命周期
// ==========================================

watch([selectedCompanyIds, techFilter, wordCloudMaxWords], () => { if (currentView.value === 'wordcloud') renderWordClouds() }, { deep: true })
watch([selectedCompanyIds, techFilter, normalizeRadar], () => { if (currentView.value === 'radar') renderRadarChart() }, { deep: true })
watch([selectedCompanyIds, techFilter, barSortBy], () => { if (currentView.value === 'bar') renderBarChart() }, { deep: true })
watch([selectedCompanyIds, techFilter, clusterHeatmap], () => { if (currentView.value === 'distribution') renderHeatmap() }, { deep: true })

watch(currentView, (newView) => {
  if (simulation) { simulation.stop(); simulation = null; }
  
  // 延迟渲染以确保 DOM 更新
  setTimeout(() => {
    switch (newView) {
      case 'wordcloud': renderWordClouds(); break;
      case 'radar': renderRadarChart(); break;
      case 'bar': renderBarChart(); break;
      case 'distribution': renderHeatmap(); break;
      case 'skilltree': initGalaxyChart(); break;
    }
  }, 100)
})

watch(darkMode, () => {
  switch (currentView.value) {
    case 'wordcloud': renderWordClouds(); break;
    case 'radar': renderRadarChart(); break;
    case 'bar': renderBarChart(); break;
    case 'distribution': renderHeatmap(); break;
    case 'skilltree': initGalaxyChart(); break;
  }
})

onMounted(() => {
  renderWordClouds()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (simulation) simulation.stop()
  Object.values(wordcloudInstances.value).forEach(i => i && i.dispose())
  if (radarChartInstance) echarts.dispose(radarChartInstance)
  if (barChartInstance) echarts.dispose(barChartInstance)
  if (heatmapChartInstance) echarts.dispose(heatmapChartInstance)
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  Object.values(wordcloudInstances.value).forEach(i => i && i.resize())
  if (radarChartInstance) radarChartInstance.resize()
  if (barChartInstance) barChartInstance.resize()
  if (heatmapChartInstance) heatmapChartInstance.resize()
  if (currentView.value === 'skilltree') initGalaxyChart()
}
</script>

<style scoped>
/* ==========================================
   原 TechStackView 样式 (保留)
   ========================================== */
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

.subtitle { margin-top: 0.5rem; color: #666; font-size: 1rem; }
[data-theme="dark"] .subtitle { color: #aaa; }

.main-content {
  display: flex;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  gap: 1.5rem;
  height: calc(100vh - 150px); /* 确保有足够高度 */
}

.control-panel {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .section-card { background: #252540; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); }
.section-card h3 { margin-top: 0; margin-bottom: 1.2rem; font-size: 1.1rem; color: #333; display: flex; align-items: center; gap: 0.5rem; }
[data-theme="dark"] .section-card h3 { color: #f0f0f0; }

.tag { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.3rem; margin-right: 5px; margin-bottom: 5px;}
.tag-remove { background: rgba(255, 255, 255, 0.3); border: none; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.clear-btn { background: none; border: 1px solid #ff6b6b; color: #ff6b6b; padding: 0.3rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.company-list { max-height: 250px; overflow-y: auto; }
.company-item { display: flex; align-items: center; padding: 0.8rem; border-radius: 10px; cursor: pointer; transition: background 0.2s; margin-bottom: 0.5rem; }
.company-item:hover { background: #f5f7ff; }
[data-theme="dark"] .company-item:hover { background: #2a2a4a; }
.company-item.selected { background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-left: 4px solid #667eea; }
.company-name { font-weight: 500; color: #333; }
[data-theme="dark"] .company-name { color: #f0f0f0; }
.tech-count { font-size: 0.8rem; color: #666; background: #f0f0f0; padding: 0.2rem 0.6rem; border-radius: 10px; margin-left: auto; }
[data-theme="dark"] .tech-count { color: #aaa; background: #333; }

.search-input { width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9; }
[data-theme="dark"] .search-input { background: #333; border-color: #555; color: #f0f0f0; }
.tech-filter { max-height: 200px; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tech-tag { background: #f0f5ff; border: 1px solid #d1ddff; padding: 0.5rem 0.8rem; border-radius: 20px; font-size: 0.85rem; cursor: pointer; }
[data-theme="dark"] .tech-tag { background: #2a2a4a; border-color: #444; color: #ddd; }
.tech-tag.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }

.view-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
.view-btn { display: flex; align-items: center; gap: 0.8rem; padding: 0.9rem 1rem; background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 10px; cursor: pointer; font-size: 0.95rem; }
[data-theme="dark"] .view-btn { background: #2a2a4a; border-color: #444; color: #f0f0f0; }
.view-btn:hover { background: #e9ecef; }
[data-theme="dark"] .view-btn:hover { background: #3a3a5a; }
.view-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }

.action-buttons { display: flex; flex-direction: column; gap: 0.8rem; }
.action-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem; background: linear-gradient(135deg, #6a89cc 0%, #4a69bd 100%); color: white; border: none; border-radius: 10px; cursor: pointer; }

.visualization-area { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; overflow: hidden; }
.view-header { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); }
[data-theme="dark"] .view-header { background: #252540; }
.view-header h2 { margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: #333; }
[data-theme="dark"] .view-header h2 { color: #f0f0f0; }
.view-subtitle { font-size: 1rem; color: #666; font-weight: normal; }
.view-description { margin-top: 0.5rem; color: #666; font-size: 0.95rem; }

.visualization-container { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08); flex: 1; display: flex; flex-direction: column; position: relative; }
[data-theme="dark"] .visualization-container { background: #252540; }

.chart-container { flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow: hidden; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.chart-header h3 { margin: 0; color: #333; font-size: 1.2rem; }
[data-theme="dark"] .chart-header h3 { color: #f0f0f0; }

.wordclouds-container { flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; overflow-y: auto; padding: 0.5rem; }
.wordcloud-card { background: #f9faff; border-radius: 12px; padding: 1.2rem; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); border: 1px solid #e6eeff; height: 300px; display: flex; flex-direction: column; }
[data-theme="dark"] .wordcloud-card { background: #2a2a4a; border-color: #444; }
.wordcloud-card h4 { margin: 0 0 0.5rem; text-align: center; color: #333; }
[data-theme="dark"] .wordcloud-card h4 { color: #f0f0f0; }
.wordcloud { flex: 1; width: 100%; }

.radar-chart-container, .bar-chart-container, .heatmap-container { flex: 1; min-height: 400px; width: 100%; }
.radar-chart, .bar-chart, .heatmap-chart { width: 100%; height: 100%; }

.table-container { flex: 1; display: flex; flex-direction: column; padding: 1.5rem; overflow: hidden; }
.table-wrapper { flex: 1; overflow: auto; border: 1px solid #e9ecef; border-radius: 8px; }
.comparison-table { width: 100%; border-collapse: collapse; min-width: 800px; }
.comparison-table th { background: #f8f9fa; padding: 0.8rem; text-align: center; border-bottom: 2px solid #dee2e6; position: sticky; top: 0; z-index: 10; }
[data-theme="dark"] .comparison-table th { background: #2a2a4a; color: #f0f0f0; border-bottom-color: #444; }
.comparison-table td { padding: 0.6rem; text-align: center; border-bottom: 1px solid #e9ecef; }
[data-theme="dark"] .comparison-table td { border-bottom-color: #444; color: #ccc; }
.sticky-cell { position: sticky; left: 0; z-index: 5; background: white; border-right: 1px solid #e9ecef; }
[data-theme="dark"] .sticky-cell { background: #252540; border-right-color: #444; color: #f0f0f0; }
.has-tech { background: rgba(76, 175, 80, 0.1); }
.tech-weight { background: rgba(76, 175, 80, 0.2); color: #2E7D32; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.8rem; margin-left: 4px; }
.highlight-tech { background: rgba(255, 193, 7, 0.2) !important; }

.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #666; }
.empty-icon { font-size: 4rem; margin-bottom: 1rem; }
.sample-hint { background: #f8f9ff; padding: 1rem; border-radius: 10px; margin-top: 1rem; font-size: 0.9rem; }
[data-theme="dark"] .sample-hint { background: #2a2a4a; color: #ccc; }
.sample-btn { background: #667eea; color: white; border: none; padding: 0.3rem 0.8rem; border-radius: 4px; cursor: pointer; margin-left: 0.5rem; }

.app-footer { text-align: center; padding: 1rem; color: #666; font-size: 0.9rem; border-top: 1px solid #eee; background: white; }
[data-theme="dark"] .app-footer { background: #1e1e2e; border-top-color: #333; color: #aaa; }

/* ==========================================
   Skill Tree (Galaxy) 专用样式
   ========================================== */
.skill-galaxy-view { position: relative; height: 100%; display: flex; flex-direction: row; }
.galaxy-wrapper { flex: 1; height: 100%; position: relative; overflow: hidden; cursor: grab; background: radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%); }
[data-theme="dark"] .galaxy-wrapper { background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); }
.galaxy-wrapper:active { cursor: grabbing; }

.galaxy-svg { width: 100%; height: 100%; }

.galaxy-controls-overlay {
  position: absolute; bottom: 20px; left: 20px;
  background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(4px);
  padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0;
  pointer-events: none; user-select: none;
}
[data-theme="dark"] .galaxy-controls-overlay { background: rgba(30, 41, 59, 0.8); border-color: #475569; }
.hint-text { font-size: 0.85rem; color: #64748b; font-weight: 500; }
[data-theme="dark"] .hint-text { color: #94a3b8; }

.info-panel {
  position: absolute; right: 20px; top: 20px; bottom: 20px; width: 380px;
  border-radius: 16px; overflow: hidden; z-index: 50;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  display: flex; flex-direction: column;
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(24px);
  border: 1px solid #e2e8f0;
}
[data-theme="dark"] .info-panel { background: rgba(30, 41, 59, 0.95); border-color: #475569; }

.panel-bg-glow { position: absolute; top: -50px; left: -50px; width: 250px; height: 250px; border-radius: 50%; filter: blur(90px); opacity: 0.15; pointer-events: none; }
.panel-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; }
.panel-header { padding: 20px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; }
[data-theme="dark"] .panel-header { border-bottom-color: #334155; }

.panel-icon-svg { width: 48px; height: 48px; border-radius: 12px; border: 1px solid; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; }
.panel-title { font-size: 1.3rem; font-weight: bold; color: #1e293b; line-height: 1.2; }
[data-theme="dark"] .panel-title { color: #f1f5f9; }
.panel-tag { font-size: 0.75rem; border: 1px solid; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 6px; opacity: 0.8; }

.close-btn { margin-left: auto; background: none; border: none; color: #94a3b8; font-size: 1.6rem; cursor: pointer; }
.close-btn:hover { color: #334155; }
[data-theme="dark"] .close-btn:hover { color: #f1f5f9; }

.panel-body { padding: 20px; flex: 1; overflow-y: auto; }
.section-title { font-size: 0.8rem; color: #64748b; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
[data-theme="dark"] .section-title { color: #94a3b8; }
.desc-text { line-height: 1.6; color: #475569; font-size: 0.95rem; margin-bottom: 24px; }
[data-theme="dark"] .desc-text { color: #cbd5e1; }

.stat-group { margin-bottom: 24px; padding: 12px; background: #f8fafc; border-radius: 8px; }
[data-theme="dark"] .stat-group { background: #1e293b; }
.stat-row { margin-bottom: 12px; }
.stat-label-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
.stat-label { font-size: 0.8rem; color: #64748b; }
[data-theme="dark"] .stat-label { color: #94a3b8; }
.stat-score { font-family: monospace; font-weight: bold; color: #334155; }
[data-theme="dark"] .stat-score { color: #cbd5e1; }
.progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
[data-theme="dark"] .progress-bar { background: #334155; }
.progress-fill { height: 100%; transition: width 0.5s ease-out; }

.quiz-section { margin-bottom: 24px; padding: 16px; background: #f0f9ff; border-radius: 12px; border: 1px dashed #bae6fd; }
[data-theme="dark"] .quiz-section { background: rgba(14, 165, 233, 0.1); border-color: rgba(14, 165, 233, 0.3); }
.sub-title { font-size: 0.9rem; color: #0284c7; border-bottom: 1px solid #e0f2fe; padding-bottom: 8px; margin-bottom: 12px; font-weight: bold; }
.quiz-intro { font-size: 0.9rem; color: #475569; margin-bottom: 12px; }
[data-theme="dark"] .quiz-intro { color: #cbd5e1; }
.quiz-question { font-weight: bold; margin-bottom: 8px; color: #334155; font-size: 0.95rem; }
[data-theme="dark"] .quiz-question { color: #f1f5f9; }
.quiz-option-label { display: block; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-bottom: 6px; transition: background 0.2s; }
[data-theme="dark"] .quiz-option-label { background: #1e293b; border-color: #334155; color: #cbd5e1; }
.quiz-option-label:hover { background: #f8fafc; }
[data-theme="dark"] .quiz-option-label:hover { background: #334155; }
.quiz-option-label.selected { background: #dcfce7; border: 1px solid #22c55e; color: #166534; }
[data-theme="dark"] .quiz-option-label.selected { background: rgba(34, 197, 94, 0.2); border-color: #22c55e; color: #86efac; }
.quiz-actions { display: flex; justify-content: space-between; margin-top: 16px; }

.btn-primary { background: #3b82f6; color: white; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { background: transparent; color: #64748b; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
[data-theme="dark"] .btn-secondary { color: #94a3b8; border-color: #475569; }
.btn-secondary:hover { color: #334155; border-color: #94a3b8; }

.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-tag { font-size: 0.85rem; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0; background: #fff; color: #334155; }
[data-theme="dark"] .skill-tag { background: #1e293b; border-color: #334155; color: #cbd5e1; }
.highlight-tag { cursor: pointer; }
.highlight-tag:hover { border-color: #3b82f6; color: #3b82f6; }
.link-icon { font-size: 0.7rem; margin-left: 4px; opacity: 0.6; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.4); opacity: 0.25; }
  100% { transform: scale(1); opacity: 0.1; }
}
:deep(.pulse-circle) { animation: pulse 3s infinite ease-in-out; transform-origin: center; }

.slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateX(30px); opacity: 0; }
</style>