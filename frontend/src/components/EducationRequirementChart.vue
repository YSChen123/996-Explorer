<template>
  <div class="edu-chart">
    <!-- 标题区域 -->
    <div class="header">
      <div class="title-section">
        <h2 class="title">
          <span class="title-icon">📊</span>
          学历要求对比分析
        </h2>
        <p class="subtitle">各科技公司招聘学历分布与趋势洞察</p>
      </div>
      <div class="controls">
        <div class="control-group">
          <label class="control">
            <span class="control-label">
              <span class="control-icon">↕️</span>
              排序方式
            </span>
            <select v-model="sortBy" class="control-select">
              <option value="name">按公司名称</option>
              <option value="bachelor">按本科占比（高→低）</option>
              <option value="master">按硕士占比（高→低）</option>
              <option value="phd">按博士占比（高→低）</option>
              <option value="college">按大专占比（高→低）</option>
              <option value="high">按高学历依赖（高→低）</option>
            </select>
          </label>
          
          <label class="control">
            <span class="control-label">
              <span class="control-icon">🏢</span>
              选中公司
            </span>
            <select v-model="activeIndexStr" class="control-select">
              <option v-for="(c,i) in sortedData" :key="c.name" :value="String(i)">
                {{ c.name }}（本科:{{ c.bachelor }}%）
              </option>
            </select>
          </label>
        </div>
        
        <div class="view-toggle">
          <button 
            v-for="view in viewTypes" 
            :key="view.id"
            :class="['view-btn', { active: currentView === view.id }]"
            @click="currentView = view.id"
          >
            <span class="view-icon">{{ view.icon }}</span>
            {{ view.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <div class="overview-card" v-for="stat in overviewStats" :key="stat.label">
        <div class="overview-value">{{ stat.value }}</div>
        <div class="overview-label">{{ stat.label }}</div>
        <div class="overview-trend" :class="stat.trend">
          <span class="trend-icon">{{ stat.trendIcon }}</span>
          {{ stat.trendText }}
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <div class="legend-title">学历类别</div>
      <div class="legend-items">
        <span v-for="key in order" :key="key" class="legend-item">
          <span class="swatch" :style="{ 
            background: `linear-gradient(135deg, ${colors[key]}, ${lightenColor(colors[key], 30)})`,
            boxShadow: `0 2px 4px ${colors[key]}40`
          }"></span>
          <span class="legend-text">{{ labels[key] }}</span>
          <span class="legend-value">{{ getAverage(key) }}%</span>
        </span>
      </div>
    </div>

    <!-- 主可视化区域 -->
    <div class="viz" v-show="currentView === 'chart'">
      <!-- 堆叠柱状图 -->
      <div class="stacked-wrapper">
        <div class="chart-header">
          <h3>学历分布堆叠柱状图</h3>
          <div class="chart-actions">
            <button class="action-btn" @click="toggleGrid">
              <span class="action-icon">{{ showGrid ? '◼️' : '◻️' }}</span>
              网格
            </button>
            <button class="action-btn" @click="exportChart">
              <span class="action-icon">📥</span>
              导出
            </button>
          </div>
        </div>
        
        <svg :width="chartW" :height="chartH" class="stacked-chart">
          <!-- 背景网格 -->
          <template v-if="showGrid">
            <template v-for="t in yTicks" :key="'grid-'+t">
              <line
                :x1="paddingLeft"
                :x2="chartW - paddingRight"
                :y1="yScale(t)"
                :y2="yScale(t)"
                stroke="#f0f2f5"
                stroke-dasharray="4 2"
              />
            </template>
          </template>
          
          <!-- Y轴 -->
          <g class="y-axis">
            <line
              :x1="paddingLeft"
              :y1="paddingTop"
              :x2="paddingLeft"
              :y2="chartH - paddingBottom"
              stroke="#d0d7e7"
              stroke-width="1.5"
            />
            <template v-for="t in yTicks" :key="'tick-'+t">
              <text
                :x="paddingLeft - 10"
                :y="yScale(t) + 4"
                text-anchor="end"
                font-size="12"
                fill="#64748b"
                class="axis-label"
              >{{ t }}%</text>
            </template>
          </g>

          <!-- X轴 -->
          <line
            :x1="paddingLeft"
            :y1="chartH - paddingBottom"
            :x2="chartW - paddingRight"
            :y2="chartH - paddingBottom"
            stroke="#d0d7e7"
            stroke-width="1.5"
          />

          <!-- 柱子 -->
          <g class="bars">
            <template v-for="(c, i) in sortedData" :key="'bar-'+c.name">
              <g
                :transform="`translate(${xScale(i)}, 0)`"
                @click="selectCompany(i)"
                @mouseenter="hoverIndex = i"
                @mouseleave="hoverIndex = -1"
                class="bar-group"
              >
                <!-- 背景矩形 -->
                <rect
                  :x="0"
                  :y="paddingTop"
                  :width="barWidth"
                  :height="chartH - paddingBottom - paddingTop"
                  fill="transparent"
                  class="bar-hit-area"
                />
                
                <!-- 堆叠段 -->
                <template v-for="seg in verticalSegments(c)" :key="'segment-'+seg.key">
                  <rect
                    :x="0"
                    :y="yScale(seg.y1)"
                    :width="barWidth"
                    :height="yScale(seg.y0) - yScale(seg.y1)"
                    :fill="colors[seg.key]"
                    :class="['bar-segment', { highlighted: hoverIndex === i || activeIndex === i }]"
                    rx="3"
                  >
                    <title>{{ c.name }} - {{ labels[seg.key] }}：{{ seg.value }}%</title>
                  </rect>
                  
                  <!-- 数值标签 -->
                  <text
                    v-if="seg.value >= 10 && (hoverIndex === i || activeIndex === i)"
                    :x="barWidth / 2"
                    :y="yScale((seg.y0 + seg.y1) / 2)"
                    text-anchor="middle"
                    font-size="10"
                    fill="#fff"
                    font-weight="600"
                    class="value-label"
                  >
                    {{ seg.value }}%
                  </text>
                </template>
                
                <!-- 高亮边框 -->
                <rect
                  v-if="activeIndex === i"
                  :x="-2"
                  :y="yScale(100) - 2"
                  :width="barWidth + 4"
                  :height="(yScale(0) - yScale(100)) + 4"
                  fill="none"
                  stroke="#4f46e5"
                  stroke-width="2"
                  rx="6"
                  class="highlight-border"
                />
                
                <!-- 悬停效果 -->
                <rect
                  v-if="hoverIndex === i && hoverIndex !== activeIndex"
                  :x="-2"
                  :y="yScale(100) - 2"
                  :width="barWidth + 4"
                  :height="(yScale(0) - yScale(100)) + 4"
                  fill="none"
                  stroke="#a5b4fc"
                  stroke-width="1.5"
                  rx="6"
                  class="hover-border"
                />
              </g>
              
              <!-- X轴标签 -->
              <g :transform="`translate(${xScale(i) + barWidth/2}, ${chartH - paddingBottom + 20})`">
                <text
                  text-anchor="middle"
                  font-size="12"
                  fill="#475569"
                  font-weight="500"
                  class="company-label"
                >
                  {{ c.name }}
                </text>
                <text
                  v-if="activeIndex === i"
                  :y="16"
                  text-anchor="middle"
                  font-size="10"
                  fill="#4f46e5"
                  font-weight="600"
                  class="active-label"
                >
                  已选中
                </text>
              </g>
            </template>
          </g>
          
          <!-- 图例指示器 -->
          <g v-if="activeIndex !== -1">
            <line
              :x1="xScale(activeIndex) + barWidth/2"
              :x2="xScale(activeIndex) + barWidth/2"
              :y1="paddingTop"
              :y2="chartH - paddingBottom"
              stroke="#4f46e5"
              stroke-width="1"
              stroke-dasharray="4 2"
              class="indicator-line"
            />
          </g>
        </svg>
        
        <div class="chart-footer">
          <div class="chart-legend">
            <span class="legend-dot" style="background: #4f46e5;"></span>
            当前选中
            <span class="legend-dot" style="background: #a5b4fc; margin-left: 16px;"></span>
            悬停状态
          </div>
          <div class="chart-stats">
            共 {{ sortedData.length }} 家公司 • 平均本科占比 {{ getAverage('bachelor').toFixed(1) }}%
          </div>
        </div>
      </div>

      <!-- 雷达图 -->
      <div class="radar-wrapper">
        <div class="radar-header">
          <h3>雷达图分析</h3>
          <div class="company-selector">
            <select v-model="radarCompanyIndex" class="company-select">
              <option v-for="(c,i) in sortedData" :key="'radar-'+c.name" :value="i">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="radar-container">
          <svg :width="radarSize" :height="radarSize" class="radar-chart">
            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3" />
                <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.1" />
              </linearGradient>
            </defs>
            
            <g :transform="`translate(${radarCenter}, ${radarCenter})`">
              <!-- 网格环 -->
              <template v-for="(level,li) in radarLevels" :key="'level-'+li">
                <polygon
                  :points="gridPolygon(level)"
                  fill="none"
                  stroke="#e2e8f0"
                  stroke-width="1"
                  class="grid-ring"
                />
                <text
                  :x="0"
                  :y="-level*radarRadius - 8"
                  text-anchor="middle"
                  font-size="11"
                  fill="#94a3b8"
                  class="grid-label"
                >
                  {{ Math.round(level*100) }}%
                </text>
              </template>
              
              <!-- 维度轴线 -->
              <template v-for="(key, idx) in order" :key="'axis-'+key">
                <line
                  x1="0" y1="0"
                  :x2="axisPoint(idx, 1.05).x"
                  :y2="axisPoint(idx, 1.05).y"
                  stroke="#cbd5e1"
                  stroke-width="1.2"
                  class="dimension-line"
                />
                <text
                  :x="axisPoint(idx, 1.15).x"
                  :y="axisPoint(idx, 1.15).y"
                  text-anchor="middle"
                  font-size="12"
                  fill="#475569"
                  font-weight="500"
                  class="dimension-label"
                >
                  {{ labels[key] }}
                </text>
              </template>
              
              <!-- 公司数据多边形 -->
              <polygon
                v-if="radarCompany"
                :points="companyPolygon(radarCompany)"
                fill="url(#radarGradient)"
                stroke="#6366f1"
                stroke-width="2"
                class="radar-polygon"
              />
              
              <!-- 数据点 -->
              <template v-if="radarCompany" v-for="(key, idx) in order" :key="'point-'+key">
                <circle
                  :cx="axisPoint(idx, (radarCompany[key]||0)/100).x"
                  :cy="axisPoint(idx, (radarCompany[key]||0)/100).y"
                  r="4"
                  :fill="colors[key]"
                  stroke="#fff"
                  stroke-width="1.5"
                  class="data-point"
                >
                  <title>{{ labels[key] }}：{{ radarCompany[key] }}%</title>
                </circle>
                
                <!-- 数据标签 -->
                <text
                  :x="axisPoint(idx, (radarCompany[key]||0)/100 + 0.05).x"
                  :y="axisPoint(idx, (radarCompany[key]||0)/100 + 0.05).y"
                  text-anchor="middle"
                  font-size="10"
                  fill="#475569"
                  font-weight="600"
                  class="data-label"
                >
                  {{ radarCompany[key] }}%
                </text>
              </template>
              
              <!-- 中心点 -->
              <circle cx="0" cy="0" r="3" fill="#6366f1" class="center-point" />
            </g>
          </svg>
          
          <div class="radar-info">
            <div class="company-info">
              <h4>{{ radarCompany?.name || '未选择' }}</h4>
              <div class="info-grid">
                <div class="info-item" v-for="key in order" :key="'info-'+key">
                  <span class="info-label" :style="{ color: colors[key] }">
                    {{ labels[key] }}
                  </span>
                  <span class="info-value">{{ radarCompany ? radarCompany[key] : 0 }}%</span>
                </div>
              </div>
            </div>
            
            <div class="radar-analysis">
              <h5>分析结论</h5>
              <div class="badge-group">
                <span 
                  class="badge" 
                  :class="getAnalysisClass('high')"
                  v-if="radarCompany && highDegree(radarCompany) >= 35"
                >
                  🎓 高学历依赖强
                </span>
                <span 
                  class="badge" 
                  :class="getAnalysisClass('bachelor')"
                  v-if="radarCompany && radarCompany.bachelor >= 60"
                >
                  📚 本科更友好
                </span>
                <span 
                  class="badge" 
                  :class="getAnalysisClass('balance')"
                  v-if="radarCompany && isBalanced(radarCompany)"
                >
                  ⚖️ 学历分布均衡
                </span>
              </div>
              <p class="analysis-note">
                {{ getAnalysisText(radarCompany) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格视图 -->
    <div class="table-view" v-show="currentView === 'table'">
      <div class="table-header">
        <h3>详细数据表格</h3>
        <div class="table-actions">
          <button class="action-btn" @click="exportTable">
            <span class="action-icon">📋</span>
            导出CSV
          </button>
          <button class="action-btn" @click="toggleAllExpand">
            <span class="action-icon">{{ allExpanded ? '📕' : '📖' }}</span>
            {{ allExpanded ? '收起全部' : '展开全部' }}
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortTable('name')" :class="{ sorted: tableSortBy === 'name' }">
                公司名称
                <span class="sort-icon">{{ tableSortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortTable('bachelor')" :class="{ sorted: tableSortBy === 'bachelor' }">
                本科
                <span class="sort-icon">{{ tableSortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortTable('master')" :class="{ sorted: tableSortBy === 'master' }">
                硕士
                <span class="sort-icon">{{ tableSortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortTable('phd')" :class="{ sorted: tableSortBy === 'phd' }">
                博士
                <span class="sort-icon">{{ tableSortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortTable('college')" :class="{ sorted: tableSortBy === 'college' }">
                大专
                <span class="sort-icon">{{ tableSortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th @click="sortTable('high')" :class="{ sorted: tableSortBy === 'high' }">
                高学历依赖
                <span class="sort-icon">{{ tableSortOrder === 'asc' ? '↑' : '↓' }}</span>
              </th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="c in tableData" 
              :key="'row-'+c.name"
              :class="{ 
                active: activeIndex === sortedData.findIndex(s => s.name === c.name),
                expanded: expandedRows.includes(c.name)
              }"
            >
              <td class="company-cell">
                <div class="company-info-cell">
                  <span class="company-logo">{{ c.name.charAt(0) }}</span>
                  <span class="company-name">{{ c.name }}</span>
                  <button 
                    class="expand-btn"
                    @click="toggleRowExpand(c.name)"
                  >
                    {{ expandedRows.includes(c.name) ? '−' : '+' }}
                  </button>
                </div>
              </td>
              <td :style="{ '--value': c.bachelor }">
                <div class="value-cell">
                  <div class="value-bar" :style="{ width: c.bachelor + '%' }"></div>
                  <span class="value-text">{{ c.bachelor }}%</span>
                </div>
              </td>
              <td :style="{ '--value': c.master }">
                <div class="value-cell">
                  <div class="value-bar" :style="{ width: c.master + '%' }"></div>
                  <span class="value-text">{{ c.master }}%</span>
                </div>
              </td>
              <td :style="{ '--value': c.phd }">
                <div class="value-cell">
                  <div class="value-bar" :style="{ width: c.phd + '%' }"></div>
                  <span class="value-text">{{ c.phd }}%</span>
                </div>
              </td>
              <td :style="{ '--value': c.college }">
                <div class="value-cell">
                  <div class="value-bar" :style="{ width: c.college + '%' }"></div>
                  <span class="value-text">{{ c.college }}%</span>
                </div>
              </td>
              <td>
                <div class="high-degree">
                  {{ c.master + c.phd }}%
                  <div class="degree-bar">
                    <div 
                      class="degree-fill" 
                      :style="{ width: (c.master + c.phd) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>
                <button 
                  class="row-action-btn"
                  @click="selectCompany(sortedData.findIndex(s => s.name === c.name))"
                >
                  查看详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 展开的行详情 -->
      <div class="row-details" v-for="c in tableData.filter(c => expandedRows.includes(c.name))" :key="'detail-'+c.name">
        <div class="detail-card">
          <div class="detail-header">
            <h4>{{ c.name }} - 学历分布详情</h4>
            <span class="detail-total">总计: {{ c.bachelor + c.master + c.phd + c.college }}%</span>
          </div>
          <div class="detail-chart">
            <div class="detail-bar" v-for="key in order" :key="'detail-'+key">
              <div class="detail-label">{{ labels[key] }}</div>
              <div class="detail-track">
                <div 
                  class="detail-fill" 
                  :style="{ 
                    width: c[key] + '%',
                    background: colors[key]
                  }"
                ></div>
              </div>
              <div class="detail-value">{{ c[key] }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜 -->
    <div class="ranking-section">
      <div class="section-header">
        <h3>
          <span class="section-icon">🏆</span>
          学历倾向排行榜
        </h3>
        <div class="rank-toggle">
          <button 
            :class="['rank-btn', { active: rankView === 'bachelor' }]"
            @click="rankView = 'bachelor'"
          >
            本科友好度
          </button>
          <button 
            :class="['rank-btn', { active: rankView === 'high' }]"
            @click="rankView = 'high'"
          >
            高学历依赖度
          </button>
        </div>
      </div>
      
      <div class="rankings">
        <div class="rank-list" v-show="rankView === 'bachelor'">
          <div 
            v-for="(c, index) in byBachelor" 
            :key="'rank-b-'+c.name"
            class="rank-item"
            :class="getRankClass(index)"
          >
            <div class="rank-position">
              <span class="rank-number">{{ index + 1 }}</span>
              <div class="rank-medal" v-if="index < 3">
                {{ ['🥇', '🥈', '🥉'][index] }}
              </div>
            </div>
            <div class="rank-company">
              <span class="rank-logo">{{ c.name.charAt(0) }}</span>
              <span class="rank-name">{{ c.name }}</span>
            </div>
            <div class="rank-value">
              <div class="rank-bar-container">
                <div 
                  class="rank-bar" 
                  :style="{ width: c.bachelor + '%' }"
                ></div>
              </div>
              <span class="rank-percent">{{ c.bachelor }}%</span>
            </div>
          </div>
        </div>
        
        <div class="rank-list" v-show="rankView === 'high'">
          <div 
            v-for="(c, index) in byHigh" 
            :key="'rank-h-'+c.name"
            class="rank-item"
            :class="getRankClass(index)"
          >
            <div class="rank-position">
              <span class="rank-number">{{ index + 1 }}</span>
              <div class="rank-medal" v-if="index < 3">
                {{ ['🥇', '🥈', '🥉'][index] }}
              </div>
            </div>
            <div class="rank-company">
              <span class="rank-logo">{{ c.name.charAt(0) }}</span>
              <span class="rank-name">{{ c.name }}</span>
            </div>
            <div class="rank-value">
              <div class="rank-bar-container">
                <div 
                  class="rank-bar" 
                  :style="{ width: (c.master + c.phd) + '%' }"
                ></div>
              </div>
              <span class="rank-percent">{{ c.master + c.phd }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="summary">
      <div class="summary-header">
        <h4>📝 数据摘要</h4>
        <div class="summary-actions">
          <button class="summary-btn" @click="generateReport">
            <span class="summary-icon">📄</span>
            生成报告
          </button>
        </div>
      </div>
      <div class="summary-content">
        <div class="summary-text">
          <p>• 本次分析共包含 <strong>{{ sortedData.length }}</strong> 家科技公司</p>
          <p>• 平均本科占比：<strong>{{ getAverage('bachelor').toFixed(1) }}%</strong>，硕士占比：<strong>{{ getAverage('master').toFixed(1) }}%</strong></p>
          <p>• 高学历依赖度（硕士+博士）平均：<strong>{{ ((getAverage('master') + getAverage('phd'))).toFixed(1) }}%</strong></p>
          <p>• 本科最友好的公司：<strong>{{ byBachelor[0]?.name }}</strong> ({{ byBachelor[0]?.bachelor }}%)</p>
          <p>• 高学历最依赖的公司：<strong>{{ byHigh[0]?.name }}</strong> ({{ (byHigh[0]?.master || 0) + (byHigh[0]?.phd || 0) }}%)</p>
        </div>
        <div class="summary-tip">
          <div class="tip-icon">💡</div>
          <div class="tip-content">
            <strong>洞察建议：</strong> 根据数据趋势，建议求职者根据不同公司学历偏好调整策略，高学历依赖型公司适合硕士以上学历者投递。
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-info">
          <span class="footer-icon">ℹ️</span>
          提示：点击图表或表格切换选中公司；数据为百分比，每家公司总和约为100%。
        </div>
        <div class="footer-actions">
          <button class="footer-btn" @click="resetView">
            <span class="footer-btn-icon">🔄</span>
            重置视图
          </button>
          <button class="footer-btn" @click="refreshData">
            <span class="footer-btn-icon">🔄</span>
            刷新数据
          </button>
        </div>
      </div>
      <div class="footer-meta">
        <span class="meta-item">最后更新: {{ lastUpdate }}</span>
        <span class="meta-item">数据源: 公司招聘数据分析</span>
        <span class="meta-item">版本: v2.1</span>
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
      { name: '阿里', bachelor: 62, master: 30, phd: 3, college: 5 },
      { name: '腾讯', bachelor: 58, master: 34, phd: 2, college: 6 },
      { name: '字节', bachelor: 55, master: 36, phd: 2, college: 7 },
      { name: '美团', bachelor: 68, master: 24, phd: 1, college: 7 },
      { name: '小米', bachelor: 64, master: 27, phd: 2, college: 7 },
      { name: '华为', bachelor: 50, master: 42, phd: 3, college: 5 },
      { name: '京东', bachelor: 66, master: 25, phd: 1, college: 8 },
      { name: '网易', bachelor: 60, master: 31, phd: 2, college: 7 },
      { name: '快手', bachelor: 63, master: 28, phd: 2, college: 7 }
    ]
  },
  colors: {
    type: Object,
    default: () => ({
      bachelor: '#4f46e5', // 本科 - 靛蓝色
      master: '#10b981',   // 硕士 - 翠绿色
      phd: '#f59e0b',      // 博士 - 琥珀色
      college: '#8b5cf6'   // 大专 - 紫色
    })
  }
})

// 常量定义
const labels = { bachelor: '本科', master: '硕士', phd: '博士', college: '大专' }
const order = ['bachelor', 'master', 'phd', 'college']

// 响应式数据
const sortBy = ref('name')
const activeIndex = ref(0)
const hoverIndex = ref(-1)
const showGrid = ref(true)
const currentView = ref('chart') // 'chart' 或 'table'
const radarCompanyIndex = ref(0)
const tableSortBy = ref('name')
const tableSortOrder = ref('asc')
const expandedRows = ref([])
const allExpanded = ref(false)
const rankView = ref('bachelor')
const lastUpdate = ref('')

// 计算属性
const activeIndexStr = computed({
  get: () => String(activeIndex.value),
  set: (v) => { activeIndex.value = Number(v) }
})

const sortedData = computed(() => {
  const arr = [...props.data]
  if (sortBy.value === 'bachelor') {
    arr.sort((a,b) => (b.bachelor||0) - (a.bachelor||0))
  } else if (sortBy.value === 'master') {
    arr.sort((a,b) => (b.master||0) - (a.master||0))
  } else if (sortBy.value === 'phd') {
    arr.sort((a,b) => (b.phd||0) - (a.phd||0))
  } else if (sortBy.value === 'college') {
    arr.sort((a,b) => (b.college||0) - (a.college||0))
  } else if (sortBy.value === 'high') {
    arr.sort((a,b) => (b.master+b.phd) - (a.master+a.phd))
  } else {
    arr.sort((a,b) => String(a.name).localeCompare(String(b.name), 'zh-CN'))
  }
  return arr
})

const currentCompany = computed(() => sortedData.value[activeIndex.value] || null)
const radarCompany = computed(() => sortedData.value[radarCompanyIndex.value] || null)

// 表格数据
const tableData = computed(() => {
  const arr = [...props.data]
  const order = tableSortOrder.value === 'asc' ? 1 : -1
  
  if (tableSortBy.value === 'name') {
    arr.sort((a,b) => order * String(a.name).localeCompare(String(b.name), 'zh-CN'))
  } else if (tableSortBy.value === 'bachelor') {
    arr.sort((a,b) => order * ((b.bachelor||0) - (a.bachelor||0)))
  } else if (tableSortBy.value === 'master') {
    arr.sort((a,b) => order * ((b.master||0) - (a.master||0)))
  } else if (tableSortBy.value === 'phd') {
    arr.sort((a,b) => order * ((b.phd||0) - (a.phd||0)))
  } else if (tableSortBy.value === 'college') {
    arr.sort((a,b) => order * ((b.college||0) - (a.college||0)))
  } else if (tableSortBy.value === 'high') {
    arr.sort((a,b) => order * ((b.master+b.phd) - (a.master+a.phd)))
  }
  return arr
})

// 排行榜数据
const byBachelor = computed(() => {
  return [...props.data].sort((a,b)=> (b.bachelor||0) - (a.bachelor||0))
})
const byHigh = computed(() => {
  return [...props.data].sort((a,b)=> ((b.master||0)+(b.phd||0)) - ((a.master||0)+(a.phd||0)))
})

// 数据概览
const overviewStats = computed(() => [
  {
    value: `${getAverage('bachelor').toFixed(1)}%`,
    label: '平均本科占比',
    trend: 'up',
    trendIcon: '↗',
    trendText: '较高'
  },
  {
    value: `${(getAverage('master') + getAverage('phd')).toFixed(1)}%`,
    label: '高学历依赖度',
    trend: 'stable',
    trendIcon: '→',
    trendText: '稳定'
  },
  {
    value: props.data.length,
    label: '分析公司数量',
    trend: 'up',
    trendIcon: '↗',
    trendText: '增加'
  },
  {
    value: `${getHighest('bachelor').value}%`,
    label: '最高本科占比',
    trend: 'high',
    trendIcon: '⭐',
    trendText: getHighest('bachelor').company
  }
])

// 视图类型
const viewTypes = [
  { id: 'chart', label: '图表视图', icon: '📊' },
  { id: 'table', label: '表格视图', icon: '📋' }
]

// 图表尺寸
const chartW = 860
const chartH = 380
const paddingLeft = 50
const paddingRight = 30
const paddingTop = 25
const paddingBottom = 50
const barGap = 20

const yTicks = [0, 25, 50, 75, 100]
const yScale = (p) => {
  const y0 = paddingTop
  const y1 = chartH - paddingBottom
  return y1 - (p / 100) * (y1 - y0)
}

const barWidth = computed(() => {
  const usable = chartW - paddingLeft - paddingRight
  const n = sortedData.value.length
  return Math.max(20, (usable - (n - 1) * barGap) / n)
})

const xScale = (i) => paddingLeft + i * (barWidth.value + barGap)

// 雷达图设置
const radarSize = 360
const radarCenter = radarSize / 2
const radarRadius = radarSize * 0.35
const radarLevels = [0.25, 0.5, 0.75, 1.0]

// 辅助函数
function verticalSegments(company) {
  const total = order.reduce((s,k)=> s + (company[k] || 0), 0) || 100
  let acc = 0
  return order.map(k => {
    const v = company[k] || 0
    const y0 = acc
    acc += v
    const y1 = acc
    return { key: k, value: v, y0, y1 }
  })
}

function axisPoint(idx, rRatio) {
  const angle = (Math.PI * 2 * idx) / order.length - Math.PI / 2
  return {
    x: Math.cos(angle) * radarRadius * rRatio,
    y: Math.sin(angle) * radarRadius * rRatio
  }
}

function gridPolygon(level) {
  const pts = order.map((_, idx) => axisPoint(idx, level)).map(p => `${p.x},${p.y}`)
  return pts.join(' ')
}

function companyPolygon(c) {
  const pts = order.map(k => (c[k] || 0) / 100).map((ratio, idx) => axisPoint(idx, ratio))
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}

function highDegree(c) {
  return (c.master || 0) + (c.phd || 0)
}

function isBalanced(c) {
  const values = order.map(k => c[k] || 0)
  const max = Math.max(...values)
  const min = Math.min(...values)
  return max - min < 30
}

function getAverage(key) {
  const sum = props.data.reduce((acc, c) => acc + (c[key] || 0), 0)
  return sum / props.data.length
}

function getHighest(key) {
  let highest = props.data[0]
  props.data.forEach(c => {
    if ((c[key] || 0) > (highest[key] || 0)) {
      highest = c
    }
  })
  return {
    company: highest.name,
    value: highest[key] || 0
  }
}

function lightenColor(color, percent) {
  const num = parseInt(color.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`
}

function getAnalysisClass(type) {
  const classes = {
    high: 'badge-high',
    bachelor: 'badge-bachelor',
    balance: 'badge-balance'
  }
  return classes[type] || ''
}

function getAnalysisText(company) {
  if (!company) return ''
  
  const high = highDegree(company)
  if (high >= 40) {
    return '该公司对高学历人才依赖度较高，硕士及以上学历占比超过40%'
  } else if (company.bachelor >= 65) {
    return '该公司对本科生更为友好，本科占比超过65%'
  } else if (isBalanced(company)) {
    return '该公司学历分布较为均衡，各学历层次均有合适岗位'
  } else {
    return '该公司学历分布符合行业平均水平'
  }
}

function getRankClass(index) {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return ''
}

// 交互方法
function selectCompany(index) {
  activeIndex.value = index
  radarCompanyIndex.value = index
}

function toggleGrid() {
  showGrid.value = !showGrid.value
}

function exportChart() {
  alert('图表导出功能（支持PNG/PDF）')
}

function exportTable() {
  alert('表格导出为CSV文件')
}

function sortTable(column) {
  if (tableSortBy.value === column) {
    tableSortOrder.value = tableSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    tableSortBy.value = column
    tableSortOrder.value = 'asc'
  }
}

function toggleRowExpand(companyName) {
  const index = expandedRows.value.indexOf(companyName)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(companyName)
  }
}

function toggleAllExpand() {
  allExpanded.value = !allExpanded.value
  if (allExpanded.value) {
    expandedRows.value = props.data.map(c => c.name)
  } else {
    expandedRows.value = []
  }
}

function generateReport() {
  alert('生成分析报告功能')
}

function resetView() {
  activeIndex.value = 0
  sortBy.value = 'name'
  currentView.value = 'chart'
  expandedRows.value = []
  allExpanded.value = false
}

function refreshData() {
  alert('刷新数据功能')
}

// 初始化
onMounted(() => {
  lastUpdate.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<style scoped>
.edu-chart {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 头部样式 */
.header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.title-section {
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  font-size: 32px;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin-top: 4px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.control-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-icon {
  font-size: 14px;
}

.control-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #374151;
  min-width: 180px;
  transition: all 0.2s;
  cursor: pointer;
}

.control-select:hover {
  border-color: #9ca3af;
}

.control-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.view-toggle {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.view-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #475569;
}

.view-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.view-icon {
  font-size: 16px;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.overview-value {
  font-size: 32px;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 4px;
}

.overview-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.overview-trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.overview-trend.up {
  background: #dcfce7;
  color: #166534;
}

.overview-trend.stable {
  background: #fef3c7;
  color: #92400e;
}

.overview-trend.high {
  background: #dbeafe;
  color: #1e40af;
}

.trend-icon {
  font-size: 12px;
}

/* 图例 */
.legend {
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
}

.legend-text {
  font-size: 14px;
  color: #475569;
  font-weight: 500;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  margin-left: 4px;
}

/* 主可视化区域 */
.viz {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .viz {
    grid-template-columns: 1fr;
  }
}

.stacked-wrapper,
.radar-wrapper {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chart-header,
.radar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3,
.radar-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #4b5563;
}

.action-icon {
  font-size: 12px;
}

/* 堆叠柱状图 */
.stacked-chart {
  display: block;
  border-radius: 12px;
  background: white;
}

.y-axis line {
  stroke: #d0d7e7;
  stroke-width: 1.5;
}

.axis-label {
  font-size: 12px;
  fill: #64748b;
}

.bar-group {
  cursor: pointer;
  transition: opacity 0.2s;
}

.bar-group:hover {
  opacity: 0.9;
}

.bar-hit-area {
  opacity: 0;
}

.bar-segment {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: saturate(100%) brightness(100%);
}

.bar-segment:hover {
  filter: saturate(120%) brightness(110%);
}

.bar-segment.highlighted {
  filter: saturate(120%) brightness(110%);
}

.value-label {
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
}

.highlight-border {
  pointer-events: none;
  filter: drop-shadow(0 0 4px rgba(79, 70, 229, 0.3));
}

.hover-border {
  pointer-events: none;
}

.company-label {
  font-size: 12px;
  font-weight: 500;
  fill: #475569;
}

.active-label {
  font-weight: 600;
  fill: #4f46e5;
}

.indicator-line {
  pointer-events: none;
}

.chart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.chart-legend {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.chart-stats {
  font-size: 12px;
  color: #94a3b8;
}

/* 雷达图 */
.radar-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

@media (max-width: 1400px) {
  .radar-container {
    flex-direction: column;
  }
}

.radar-chart {
  border-radius: 12px;
  background: white;
  flex-shrink: 0;
}

.grid-ring {
  stroke: #e2e8f0;
  stroke-dasharray: 2 2;
}

.grid-label {
  font-size: 11px;
  fill: #94a3b8;
}

.dimension-line {
  stroke: #cbd5e1;
}

.dimension-label {
  font-size: 12px;
  fill: #475569;
  font-weight: 500;
}

.radar-polygon {
  stroke-linejoin: round;
  animation: polygonFadeIn 0.8s ease-out;
}

@keyframes polygonFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.data-point {
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
  transition: r 0.2s;
}

.data-point:hover {
  r: 5;
}

.data-label {
  font-size: 10px;
  font-weight: 600;
  fill: #475569;
}

.center-point {
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

.radar-info {
  flex: 1;
  min-width: 0;
}

.company-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.radar-analysis h5 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-high {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.badge-bachelor {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  color: #5b21b6;
  border: 1px solid #ddd6fe;
}

.badge-balance {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: #166534;
  border: 1px solid #bbf7d0;
}

.analysis-note {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

/* 表格视图 */
.table-view {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.data-table th:hover {
  background: #f1f5f9;
}

.data-table th.sorted {
  color: #4f46e5;
  background: #f5f3ff;
}

.sort-icon {
  margin-left: 4px;
  font-size: 10px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.data-table tbody tr.active {
  background: #f5f3ff;
}

.data-table tbody tr.expanded {
  background: #f0f9ff;
}

.company-cell {
  font-weight: 500;
}

.company-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.company-name {
  font-size: 14px;
  color: #1e293b;
}

.expand-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-left: auto;
  transition: all 0.2s;
  flex-shrink: 0;
}

.expand-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #4b5563;
}

.value-cell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-bar {
  height: 20px;
  background: linear-gradient(90deg, var(--color, #4f46e5), var(--color-light, #8b5cf6));
  border-radius: 4px;
  min-width: 2px;
  transition: width 0.5s ease-out;
  opacity: 0.9;
}

.value-text {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  min-width: 36px;
  text-align: right;
}

.high-degree {
  display: flex;
  align-items: center;
  gap: 12px;
}

.degree-bar {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.degree-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  border-radius: 3px;
  transition: width 0.5s ease-out;
}

.row-action-btn {
  padding: 6px 12px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.row-action-btn:hover {
  background: linear-gradient(135deg, #4338ca, #4f46e5);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

/* 行详情 */
.row-details {
  margin-top: 8px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.detail-total {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  background: white;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
}

.detail-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-label {
  width: 60px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.detail-track {
  flex: 1;
  height: 20px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.detail-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-value {
  width: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

/* 排行榜 */
.ranking-section {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 20px;
}

.rank-toggle {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.rank-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.rank-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  color: #475569;
}

.rank-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rankings {
  min-height: 300px;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.rank-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.rank-item.rank-first {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fbbf24;
}

.rank-item.rank-second {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-color: #cbd5e1;
}

.rank-item.rank-third {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-color: #f59e0b;
}

.rank-position {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 40px;
}

.rank-number {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  width: 20px;
}

.rank-first .rank-number,
.rank-second .rank-number,
.rank-third .rank-number {
  color: #1e293b;
}

.rank-medal {
  font-size: 16px;
}

.rank-company {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.rank-value {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 120px;
}

.rank-bar-container {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.rank-bar {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #8b5cf6);
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.rank-percent {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  min-width: 40px;
  text-align: right;
}

/* 统计摘要 */
.summary {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-actions {
  display: flex;
  gap: 8px;
}

.summary-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.summary-btn:hover {
  background: linear-gradient(135deg, #4338ca, #4f46e5);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
}

.summary-icon {
  font-size: 14px;
}

.summary-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .summary-content {
    grid-template-columns: 1fr;
  }
}

.summary-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.7;
}

.summary-text p {
  margin: 8px 0;
}

.summary-text strong {
  color: #1e293b;
  font-weight: 600;
}

.summary-tip {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #bae6fd;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.tip-icon {
  font-size: 20px;
  color: #0284c7;
  flex-shrink: 0;
}

.tip-content {
  font-size: 14px;
  color: #0c4a6e;
  line-height: 1.5;
}

.tip-content strong {
  color: #075985;
}

/* 底部 */
.footer {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.footer-info {
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-icon {
  font-size: 16px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.footer-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.footer-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #4b5563;
}

.footer-btn-icon {
  font-size: 14px;
}

.footer-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 12px;
  color: #94a3b8;
}

.meta-item {
  padding: 0 12px;
  border-right: 1px solid #e2e8f0;
}

.meta-item:last-child {
  border-right: none;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    flex-direction: column;
  }
  
  .control-select {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .edu-chart {
    padding: 16px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .viz {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .radar-container {
    flex-direction: column;
  }
  
  .summary-content {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .footer-meta {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  
  .meta-item {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 8px;
    text-align: center;
  }
  
  .meta-item:last-child {
    border-bottom: none;
  }
}

@media (max-width: 480px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .legend-items {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    justify-content: center;
  }
}
</style>