<template>
  <div class="exp-pro-card">
    <!-- 顶部 KPI 概览 -->
    <div class="kpis">
      <div class="kpi kpi-primary">
        <div class="kpi-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-title">应届友好指数</div>
          <div class="kpi-value">{{ avgFresh }}%</div>
          <div class="kpi-sub">全公司平均应届占比</div>
        </div>
        <svg :width="sparkW" :height="sparkH" class="spark">
          <polyline :points="sparkFreshPoints" fill="none" stroke="#60a5fa" stroke-width="2.5" />
        </svg>
      </div>
      
      <div class="kpi kpi-secondary">
        <div class="kpi-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-title">资深倾向分数</div>
          <div class="kpi-value">{{ Math.round(avgSeniorScore) }}</div>
          <div class="kpi-sub">综合资深权重（越高越偏资深）</div>
        </div>
        <svg :width="sparkW" :height="sparkH" class="spark">
          <polyline :points="sparkSeniorPoints" fill="none" stroke="#fb7185" stroke-width="2.5" />
        </svg>
      </div>
      
      <div class="kpi kpi-tertiary">
        <div class="kpi-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9H7V17H9V9Z" fill="currentColor"/>
            <path d="M13 9H11V13H13V9Z" fill="currentColor"/>
            <path d="M17 9H15V15H17V9Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-title">公司数量</div>
          <div class="kpi-value">{{ companies.length }}</div>
          <div class="kpi-sub">参与对比的科技公司</div>
        </div>
        <svg :width="sparkW" :height="sparkH" class="spark">
          <polyline :points="sparkCountPoints" fill="none" stroke="#34d399" stroke-width="2.5" />
        </svg>
      </div>
    </div>

    <!-- 主控制区域 -->
    <div class="main-content">
      <!-- 控件栏 -->
      <div class="header">
        <div class="title-section">
          <h2 class="title">科技公司工作经验要求分布对比</h2>
          <div class="subtitle">深度分析各大科技巨头人才招聘结构</div>
        </div>
        <div class="controls">
          <div class="control-group">
            <label class="control-label">排序方式</label>
            <select v-model="sortBy" class="styled-select">
              <option value="name">按公司名</option>
              <option value="fresh">按应届占比</option>
              <option value="senior">按资深占比</option>
              <option value="score">按经验评分</option>
            </select>
          </div>
          
          <div class="control-group">
            <label class="control-label">图表类型</label>
            <div class="toggle-buttons">
              <button 
                :class="['toggle-btn', { active: chartType === 'stack' }]" 
                @click="chartType = 'stack'"
              >
                堆叠柱状图
              </button>
              <button 
                :class="['toggle-btn', { active: chartType === 'radar' }]" 
                @click="chartType = 'radar'"
              >
                雷达图
              </button>
            </div>
          </div>
          
          <div class="control-group">
            <label class="control-label">查看公司</label>
            <select v-model="activeIdxStr" class="styled-select company-select">
              <option v-for="(c,i) in companies" :key="'opt-'+i" :value="String(i)">{{ c.name }}</option>
            </select>
          </div>
          
          <button class="btn-export" @click="exportPNG">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="btn-icon">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            导出图表
          </button>
        </div>
      </div>

      <!-- 图例区域 -->
      <div class="legend-section">
        <div class="legend-title">工作经验分布维度</div>
        <div class="legend">
          <div
            v-for="k in keys"
            :key="'lg-'+k"
            class="legend-item"
            :class="{ off: !enabled[k] }"
            @click="toggleKey(k)"
          >
            <div class="legend-color" :style="{ background: colors[k].main }"></div>
            <span class="legend-text">{{ labels[k] }}</span>
            <span class="legend-percentage">{{ enabled[k] ? '✓' : '✗' }}</span>
          </div>
        </div>
      </div>

      <!-- 主图区域 -->
      <div class="chart-container" ref="chartContainer">
        <!-- 堆叠柱状图 -->
        <svg v-if="chartType === 'stack'" ref="svgRef" class="chart-svg" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="xMidYMid meet">
          <defs>
            <!-- 渐变定义 -->
            <linearGradient id="grad-fresh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="colors.fresh.light" />
              <stop offset="100%" :stop-color="colors.fresh.main" />
            </linearGradient>
            <linearGradient id="grad-y1_3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="colors.y1_3.light" />
              <stop offset="100%" :stop-color="colors.y1_3.main" />
            </linearGradient>
            <linearGradient id="grad-y3_5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="colors.y3_5.light" />
              <stop offset="100%" :stop-color="colors.y3_5.main" />
            </linearGradient>
            <linearGradient id="grad-y5p" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="colors.y5p.light" />
              <stop offset="100%" :stop-color="colors.y5p.main" />
            </linearGradient>
            
            <!-- 阴影效果 -->
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
              <feOffset in="blur" dx="0" dy="2" result="offsetBlur"/>
              <feFlood flood-color="rgba(0,0,0,0.1)" result="color"/>
              <feComposite in="color" in2="offsetBlur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- 背景网格 -->
          <g class="grid-lines">
            <line 
              :x1="paddingLeft" 
              :y1="paddingTop" 
              :x2="paddingLeft" 
              :y2="chartHeight - paddingBottom" 
              stroke="#e5e7eb" 
              stroke-width="1.5"
            />
            <line 
              :x1="paddingLeft" 
              :y1="chartHeight - paddingBottom" 
              :x2="chartWidth - paddingRight" 
              :y2="chartHeight - paddingBottom" 
              stroke="#e5e7eb" 
              stroke-width="1.5"
            />
            <template v-for="t in yTicks" :key="'tick-'+t">
              <line 
                :x1="paddingLeft" 
                :x2="chartWidth - paddingRight" 
                :y1="yScale(t)" 
                :y2="yScale(t)" 
                stroke="#f3f4f6" 
                stroke-width="1"
              />
              <text 
                :x="paddingLeft - 10" 
                :y="yScale(t) + 4" 
                text-anchor="end" 
                font-size="13" 
                font-weight="500"
                fill="#6b7280"
              >
                {{ t }}%
              </text>
            </template>
          </g>

          <!-- Y轴标签 -->
          <text 
            :x="paddingLeft - 25" 
            :y="chartHeight / 2" 
            text-anchor="middle" 
            font-size="14" 
            font-weight="600"
            fill="#4b5563"
            transform="rotate(-90, 30, 200)"
          >
            
          </text>

          <!-- 公司组 -->
          <g class="bars-group">
            <template v-for="(c, i) in sorted" :key="'c-'+(c?.name || i)">
              <g 
                :transform="`translate(${xScale(i)}, 0)`" 
                class="bar-group"
                @mouseenter="handleBarHover(i)"
                @mouseleave="handleBarLeave"
              >
                <!-- 背景效果 -->
                <rect
                  :x="-barGap/2"
                  :y="paddingTop"
                  :width="barWidth + barGap"
                  :height="chartHeight - paddingTop - paddingBottom"
                  fill="transparent"
                  class="bar-hit-area"
                />
                
                <!-- 各维度柱子 -->
                <rect 
                  v-if="enabled.fresh"
                  class="segment"
                  :x="0"
                  :y="yScale(stackTop(c,'fresh'))"
                  :width="barWidth"
                  :height="yScale(stackBottom(c,'fresh')) - yScale(stackTop(c,'fresh'))"
                  fill="url(#grad-fresh)"
                  :opacity="hoveredBar === i || hoverKey === 'fresh' ? 1 : 0.9"
                  rx="4"
                  ry="4"
                  filter="url(#shadow)"
                >
                  <title>{{ c.name }} 应届：{{ pct(c,'fresh') }}%</title>
                </rect>

                <rect 
                  v-if="enabled.y1_3"
                  class="segment"
                  :x="0"
                  :y="yScale(stackTop(c,'y1_3'))"
                  :width="barWidth"
                  :height="yScale(stackBottom(c,'y1_3')) - yScale(stackTop(c,'y1_3'))"
                  fill="url(#grad-y1_3)"
                  :opacity="hoveredBar === i || hoverKey === 'y1_3' ? 1 : 0.9"
                  rx="4"
                  ry="4"
                  filter="url(#shadow)"
                >
                  <title>{{ c.name }} 1-3 年：{{ pct(c,'y1_3') }}%</title>
                </rect>

                <rect 
                  v-if="enabled.y3_5"
                  class="segment"
                  :x="0"
                  :y="yScale(stackTop(c,'y3_5'))"
                  :width="barWidth"
                  :height="yScale(stackBottom(c,'y3_5')) - yScale(stackTop(c,'y3_5'))"
                  fill="url(#grad-y3_5)"
                  :opacity="hoveredBar === i || hoverKey === 'y3_5' ? 1 : 0.9"
                  rx="4"
                  ry="4"
                  filter="url(#shadow)"
                >
                  <title>{{ c.name }} 3-5 年：{{ pct(c,'y3_5') }}%</title>
                </rect>

                <rect 
                  v-if="enabled.y5p"
                  class="segment"
                  :x="0"
                  :y="yScale(stackTop(c,'y5p'))"
                  :width="barWidth"
                  :height="yScale(stackBottom(c,'y5p')) - yScale(stackTop(c,'y5p'))"
                  fill="url(#grad-y5p)"
                  :opacity="hoveredBar === i || hoverKey === 'y5p' ? 1 : 0.9"
                  rx="4"
                  ry="4"
                  filter="url(#shadow)"
                >
                  <title>{{ c.name }} 5 年以上：{{ pct(c,'y5p') }}%</title>
                </rect>

                <!-- 当前公司高亮 -->
                <rect
                  v-if="current && current.name === c.name"
                  :x="-4" 
                  :y="yScale(100) - 4"
                  :width="barWidth + 8" 
                  :height="(yScale(0) - yScale(100)) + 8"
                  fill="none" 
                  stroke="#6366f1" 
                  stroke-width="3" 
                  rx="8"
                  stroke-dasharray="5,5"
                />

                <!-- 公司名 -->
                <text 
                  :x="barWidth/2" 
                  :y="chartHeight - paddingBottom + 22" 
                  text-anchor="middle" 
                  font-size="14" 
                  font-weight="600"
                  :fill="current && current.name === c.name ? '#6366f1' : '#374151'"
                >
                  {{ c?.name || ('公司' + (i + 1)) }}
                </text>
                
                <!-- 总百分比标签 -->
                <text 
                  :x="barWidth/2" 
                  :y="yScale(stackBottom(c,'y5p')) - 10" 
                  text-anchor="middle" 
                  font-size="12" 
                  font-weight="600"
                  fill="#ffffff"
                  class="total-label"
                >
                  {{ Math.round(pct(c,'fresh') + pct(c,'y1_3') + pct(c,'y3_5') + pct(c,'y5p')) }}%
                </text>
              </g>
            </template>
          </g>

          <!-- 悬停提示 -->
          <g v-if="tooltipData" class="tooltip">
            <rect
              :x="tooltipData.x - 100"
              :y="tooltipData.y - 80"
              width="200"
              height="70"
              rx="10"
              ry="10"
              fill="rgba(17, 24, 39, 0.95)"
              filter="url(#shadow)"
            />
            <text
              :x="tooltipData.x"
              :y="tooltipData.y - 55"
              text-anchor="middle"
              font-size="14"
              font-weight="600"
              fill="#ffffff"
            >
              {{ tooltipData.company }}
            </text>
            <text
              :x="tooltipData.x"
              :y="tooltipData.y - 35"
              text-anchor="middle"
              font-size="12"
              fill="#d1d5db"
            >
              应届: {{ tooltipData.fresh }}%
            </text>
            <text
              :x="tooltipData.x - 40"
              :y="tooltipData.y - 15"
              text-anchor="middle"
              font-size="12"
              fill="#d1d5db"
            >
              1-3年: {{ tooltipData.y1_3 }}%
            </text>
            <text
              :x="tooltipData.x + 40"
              :y="tooltipData.y - 15"
              text-anchor="middle"
              font-size="12"
              fill="#d1d5db"
            >
              3-5年: {{ tooltipData.y3_5 }}%
            </text>
            <text
              :x="tooltipData.x"
              :y="tooltipData.y + 5"
              text-anchor="middle"
              font-size="12"
              fill="#d1d5db"
            >
              5年以上: {{ tooltipData.y5p }}%
            </text>
          </g>
        </svg>

        <!-- 雷达图 -->
        <svg v-else ref="svgRef" class="chart-svg radar-chart" :viewBox="`0 0 ${radarSize} ${radarSize}`" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="radar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" :stop-color="radarFill" stop-opacity="0.8"/>
              <stop offset="100%" :stop-color="radarFill" stop-opacity="0.2"/>
            </linearGradient>
          </defs>
          
          <g :transform="`translate(${radarCenter}, ${radarCenter})`">
            <!-- 网格圆环 -->
            <template v-for="(level, li) in radarLevels" :key="'radar-level-'+li">
              <circle
                :cx="0"
                :cy="0"
                :r="level * radarRadius"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="1"
                stroke-dasharray="5,5"
              />
              <text
                :x="0"
                :y="-level * radarRadius - 10"
                text-anchor="middle"
                font-size="12"
                font-weight="600"
                fill="#6b7280"
              >
                {{ Math.round(level * 100) }}%
              </text>
            </template>

            <!-- 轴线和标签 -->
            <template v-for="(k, idx) in keys" :key="'axis-'+k">
              <line
                x1="0"
                y1="0"
                :x2="axisPoint(idx, 1).x"
                :y2="axisPoint(idx, 1).y"
                stroke="#d1d5db"
                stroke-width="1.5"
              />
              <text
                :x="axisPoint(idx, 1.15).x"
                :y="axisPoint(idx, 1.15).y"
                text-anchor="middle"
                font-size="14"
                font-weight="600"
                fill="#374151"
              >
                {{ labels[k] }}
              </text>
            </template>

            <!-- 当前公司雷达图 -->
            <polygon
              v-if="current"
              :points="companyRadarPolygon(current)"
              fill="url(#radar-grad)"
              :stroke="radarStroke"
              stroke-width="3"
              opacity="0.7"
            />
            
            <!-- 数据点 -->
            <template v-if="current" v-for="(k, idx) in keys" :key="'pt-'+k">
              <circle
                :cx="axisPoint(idx, (enabled[k] ? pct(current,k) : 0)/100).x"
                :cy="axisPoint(idx, (enabled[k] ? pct(current,k) : 0)/100).y"
                r="5"
                :fill="colors[k].main"
                :opacity="enabled[k] ? 1 : 0.2"
                stroke="#ffffff"
                stroke-width="2"
              >
                <title>{{ labels[k] }}：{{ pct(current,k) }}%</title>
              </circle>
            </template>

            <!-- 中心点 -->
            <circle cx="0" cy="0" r="3" fill="#6366f1" />
            
            <!-- 公司名标签 -->
            <text
              v-if="current"
              x="0"
              y="radarRadius + 40"
              text-anchor="middle"
              font-size="16"
              font-weight="700"
              fill="#6366f1"
            >
              {{ current.name }} 经验分布
            </text>
          </g>
        </svg>
      </div>

      <!-- 底部信息面板 -->
      <div class="info-panel">
        <div class="ranking-section">
          <h3 class="section-title">公司排行分析</h3>
          <div class="rank-cols">
            <div class="rank-col">
              <div class="rank-header">
                <div class="rank-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="rank-icon">
                    <path d="M12 15L8 11H16L12 15Z" fill="#60a5fa"/>
                  </svg>
                  <span>应届友好排行</span>
                </div>
                <div class="rank-subtitle">（应届占比高→低）</div>
              </div>
              <ol class="rank-list">
                <li v-for="(c, idx) in byFresh" :key="'rk-f-'+(c?.name || '-')" class="rank-item">
                  <span class="rank-number">{{ idx + 1 }}</span>
                  <span class="rank-name">{{ c?.name || '公司' }}</span>
                  <span class="rank-value">{{ pct(c,'fresh') }}%</span>
                  <div class="rank-bar" :style="{ width: `${pct(c,'fresh')}%`, background: colors.fresh.main }"></div>
                </li>
              </ol>
            </div>
            
            <div class="rank-col">
              <div class="rank-header">
                <div class="rank-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="rank-icon">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#fb7185"/>
                  </svg>
                  <span>资深偏好排行</span>
                </div>
                <div class="rank-subtitle">（资深占比高→低）</div>
              </div>
              <ol class="rank-list">
                <li v-for="(c, idx) in bySenior" :key="'rk-s-'+(c?.name || '-')" class="rank-item">
                  <span class="rank-number">{{ idx + 1 }}</span>
                  <span class="rank-name">{{ c?.name || '公司' }}</span>
                  <span class="rank-value">{{ seniorPct(c) }}%</span>
                  <div class="rank-bar" :style="{ width: `${seniorPct(c)}%`, background: colors.y5p.main }"></div>
                </li>
              </ol>
            </div>
          </div>
        </div>
        
        <div class="insights-section">
          <h3 class="section-title">数据洞察</h3>
          <div class="insights">
            <div class="insight-item">
              <div class="insight-icon">📊</div>
              <div class="insight-content">
                <div class="insight-title">应届友好指数最高</div>
                <div class="insight-value">{{ byFresh[0]?.name || '-' }}：{{ byFresh[0] ? pct(byFresh[0], 'fresh') : 0 }}%</div>
              </div>
            </div>
            <div class="insight-item">
              <div class="insight-icon">🎯</div>
              <div class="insight-content">
                <div class="insight-title">资深偏好最强</div>
                <div class="insight-value">{{ bySenior[0]?.name || '-' }}：{{ bySenior[0] ? seniorPct(bySenior[0]) : 0 }}%</div>
              </div>
            </div>
            <div class="insight-item">
              <div class="insight-icon">⚖️</div>
              <div class="insight-content">
                <div class="insight-title">经验分布最均衡</div>
                <div class="insight-value">{{ balancedCompany?.name || '-' }}</div>
              </div>
            </div>
            <div class="insight-item">
              <div class="insight-icon">📈</div>
              <div class="insight-content">
                <div class="insight-title">数据更新时间</div>
                <div class="insight-value">{{ currentDate }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-text">
          <span class="footer-icon">ℹ️</span>
          数据说明：本图表基于各大科技公司2024年公开招聘信息聚合分析，展示不同工作经验要求的岗位分布比例。数据仅供参考。
        </div>
        <div class="footer-actions">
          <button class="footer-btn" @click="refreshData">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1 20V14H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1113 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            刷新数据
          </button>
          <button class="footer-btn" @click="toggleTheme">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1125 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88299 19.5345 5.67422 18.3258C4.46545 17.117 3.62594 15.589 3.2539 13.9205C2.88186 12.252 2.99274 10.5121 3.57348 8.9043C4.15423 7.29651 5.18085 5.8875 6.53323 4.84182C7.88562 3.79614 9.50779 3.15731 11.21 3C10.2134 4.34827 9.73385 6.00945 9.85849 7.68141C9.98314 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0169 16.3186 14.1415C17.9906 14.2662 19.6517 13.7866 21 12.79Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            切换主题
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const labels = { fresh: '应届', y1_3: '1-3 年', y3_5: '3-5 年', y5p: '5 年以上' }
const keys = ['fresh','y1_3','y3_5','y5p']

const props = defineProps({
  data: {
    type: Array,
    default: () => [
      { name: '阿里巴巴',   dist: { fresh: 24, y1_3: 36, y3_5: 24, y5p: 16 } },
      { name: '腾讯',   dist: { fresh: 28, y1_3: 32, y3_5: 22, y5p: 18 } },
      { name: '字节跳动',   dist: { fresh: 22, y1_3: 34, y3_5: 26, y5p: 18 } },
      { name: '美团',   dist: { fresh: 26, y1_3: 33, y3_5: 24, y5p: 17 } },
      { name: '京东',   dist: { fresh: 25, y1_3: 38, y3_5: 22, y5p: 15 } },
      { name: '小米',   dist: { fresh: 30, y1_3: 35, y3_5: 20, y5p: 15 } },
      { name: '快手',   dist: { fresh: 32, y1_3: 36, y3_5: 18, y5p: 14 } },
      { name: '华为',   dist: { fresh: 18, y1_3: 30, y3_5: 28, y5p: 24 } },
      { name: '网易',   dist: { fresh: 27, y1_3: 34, y3_5: 23, y5p: 16 } },
      { name: '百度',   dist: { fresh: 20, y1_3: 35, y3_5: 25, y5p: 20 } },
      { name: '拼多多', dist: { fresh: 30, y1_3: 40, y3_5: 20, y5p: 10 } },
      { name: '滴滴', dist: { fresh: 29, y1_3: 37, y3_5: 20, y5p: 14 } },
      { name: '携程', dist: { fresh: 23, y1_3: 39, y3_5: 24, y5p: 14 } },
      { name: '360', dist: { fresh: 21, y1_3: 32, y3_5: 27, y5p: 20 } },
      { name: 'B站', dist: { fresh: 34, y1_3: 36, y3_5: 18, y5p: 12 } },
      { name: '蔚来', dist: { fresh: 26, y1_3: 34, y3_5: 24, y5p: 16 } },
      { name: '理想', dist: { fresh: 28, y1_3: 32, y3_5: 23, y5p: 17 } },
      { name: '小鹏', dist: { fresh: 27, y1_3: 35, y3_5: 22, y5p: 16 } },
      { name: 'OPPO', dist: { fresh: 25, y1_3: 36, y3_5: 23, y5p: 16 } },
      { name: 'VIVO', dist: { fresh: 24, y1_3: 37, y3_5: 24, y5p: 15 } }
    ]
  },
  colors: {
    type: Object,
    default: () => ({
      fresh:  { main: '#60a5fa', light: '#93c5fd' },
      y1_3:   { main: '#34d399', light: '#86efac' },
      y3_5:   { main: '#f59e0b', light: '#fbbf24' },
      y5p:    { main: '#fb7185', light: '#fda4af' }
    })
  }
})

/* 响应式图表尺寸 */
const chartContainer = ref(null)
const chartWidth = ref(1400) // 增加宽度以适应更多公司
const chartHeight = ref(550)

const updateChartSize = () => {
  if (chartContainer.value) {
    const containerWidth = chartContainer.value.clientWidth
    chartWidth.value = Math.max(1000, Math.min(1600, containerWidth))
    chartHeight.value = Math.max(450, Math.min(600, containerWidth * 0.55))
  }
}

onMounted(() => {
  updateChartSize()
  window.addEventListener('resize', updateChartSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateChartSize)
})

/* 规范化公司数据 */
const companies = computed(() => {
  const src = Array.isArray(props.data) ? props.data : []
  return src
    .filter(c => c && typeof c === 'object')
    .map((raw, idx) => {
      const name = String(raw.name ?? `未命名-${idx+1}`)
      const distRaw = raw.dist && typeof raw.dist === 'object' ? raw.dist : {}
      const dist = {}
      for (const k of keys) dist[k] = Math.min(100, Math.max(0, Number(distRaw[k] ?? 0)))
      const sum = keys.reduce((a,k)=>a+dist[k], 0)
      if (sum > 0 && Math.round(sum) !== 100) {
        for (const k of keys) dist[k] = Math.round((dist[k] / sum) * 100)
      }
      return { name, dist }
    })
})

/* 控件与选择 */
const sortBy = ref('name')
const chartType = ref('stack')
const activeIdx = ref(0)
const activeIdxStr = computed({
  get: () => String(activeIdx.value),
  set: v => { activeIdx.value = Number(v) }
})
const current = computed(() => companies.value[activeIdx.value] || null)

/* 维度开关 */
const enabled = ref({ fresh: true, y1_3: true, y3_5: true, y5p: true })
function toggleKey(k) { 
  enabled.value = { ...enabled.value, [k]: !enabled.value[k] }
}
const hoverKey = ref('')
const hoveredBar = ref(null)

/* 工具提示 */
const tooltipData = ref(null)

function handleBarHover(index) {
  hoveredBar.value = index
  const company = sorted.value[index]
  if (company) {
    tooltipData.value = {
      company: company.name,
      fresh: pct(company, 'fresh'),
      y1_3: pct(company, 'y1_3'),
      y3_5: pct(company, 'y3_5'),
      y5p: pct(company, 'y5p'),
      x: xScale(index) + barWidth / 2,
      y: yScale(50)
    }
  }
}

function handleBarLeave() {
  hoveredBar.value = null
  tooltipData.value = null
}

/* KPI 与火花线 */
const avgFresh = computed(() => {
  const arr = companies.value; if (!arr.length) return 0
  return Math.round(arr.reduce((a,c)=>a + pct(c,'fresh'), 0) / arr.length)
})

const avgSeniorScore = computed(() => {
  const arr = companies.value; if (!arr.length) return 0
  return arr.reduce((a,c)=>a + score(c), 0) / arr.length
})

const sparkW = 120, sparkH = 32
function sparkPoints(values) {
  if (!values.length) return ''
  const maxV = Math.max(...values), minV = Math.min(...values)
  const pad = 4, W = sparkW - pad*2, H = sparkH - pad*2
  return values.map((v, i) => {
    const x = pad + (i/(values.length-1)) * W
    const y = pad + (1 - (maxV===minV ? 0.5 : (v-minV)/(maxV-minV))) * H
    return `${x},${y}`
  }).join(' ')
}

const sparkFreshPoints = computed(() => sparkPoints(companies.value.map(c=>pct(c,'fresh'))))
const sparkSeniorPoints = computed(() => sparkPoints(companies.value.map(c=>score(c))))
const sparkCountPoints = computed(() => sparkPoints(companies.value.map((_,i)=>i+1)))

/* 柱状图布局参数 */
const paddingLeft = 80, paddingRight = 40, paddingTop = 40, paddingBottom = 80
const yTicks = [0, 20, 40, 60, 80, 100]
const barWidth = 50 // 稍微减小宽度以适应更多公司
const barGap = 25

const yScale = (v) => {
  const y0 = paddingTop, y1 = chartHeight.value - paddingBottom
  return y1 - (v / 100) * (y1 - y0)
}

const xScale = (i) => paddingLeft + i * (barWidth + barGap)

/* 安全取百分比与评分 */
function pct(c, k) { 
  return Math.min(100, Math.max(0, Number((c?.dist?.[k]) ?? 0))) 
}

function seniorPct(c) { 
  return Math.min(100, pct(c,'y3_5') + pct(c,'y5p')) 
}

function score(c) { 
  return pct(c,'y3_5')*1.0 + pct(c,'y5p')*1.3 - pct(c,'fresh')*0.3 
}

/* 堆叠累加位置 */
function stackTop(c,k) {
  const order = ['fresh','y1_3','y3_5','y5p']
  let sum = 0
  for (const o of order) {
    if (o === k) break
    if (enabled.value[o]) sum += pct(c,o)
  }
  return sum + (enabled.value[k] ? pct(c,k) : 0)
}

function stackBottom(c,k) {
  const order = ['fresh','y1_3','y3_5','y5p']
  let sum = 0
  for (const o of order) {
    if (o === k) break
    if (enabled.value[o]) sum += pct(c,o)
  }
  return sum
}

/* 排序 */
const sorted = computed(() => {
  const arr = [...companies.value]
  if (sortBy.value === 'name') {
    arr.sort((a,b)=> String(a.name).localeCompare(String(b.name),'zh-CN'))
  } else if (sortBy.value === 'fresh') {
    arr.sort((a,b)=> pct(b,'fresh') - pct(a,'fresh'))
  } else if (sortBy.value === 'senior') {
    arr.sort((a,b)=> seniorPct(b) - seniorPct(a))
  } else {
    arr.sort((a,b)=> score(b) - score(a))
  }
  return arr
})

/* 雷达图配置 */
const radarSize = 600
const radarCenter = radarSize / 2
const radarRadius = radarSize * 0.35
const radarLevels = [0.25, 0.5, 0.75, 1.0]

function axisPoint(idx, rRatio) {
  const angle = (Math.PI * 2 * idx) / keys.length - Math.PI / 2
  return { 
    x: Math.cos(angle) * radarRadius * rRatio, 
    y: Math.sin(angle) * radarRadius * rRatio 
  }
}

function companyRadarPolygon(c) {
  const pts = keys
    .map(k => (enabled.value[k] ? pct(c, k)/100 : 0))
    .map((ratio, idx) => axisPoint(idx, ratio))
  return pts.map(p=>`${p.x},${p.y}`).join(' ')
}

const radarFill = '#6366f1'
const radarStroke = '#6366f1'

/* 排行 */
const byFresh = computed(() => [...companies.value].sort((a,b)=> pct(b,'fresh') - pct(a,'fresh')))
const bySenior = computed(() => [...companies.value].sort((a,b)=> seniorPct(b) - seniorPct(a)))

/* 均衡公司计算 */
const balancedCompany = computed(() => {
  if (!companies.value.length) return null
  return companies.value.reduce((mostBalanced, company) => {
    const values = keys.map(k => pct(company, k))
    const mean = values.reduce((a, b) => a + b) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    const currentStdDev = Math.sqrt(variance)
    
    const balancedValues = keys.map(k => pct(mostBalanced, k))
    const balancedMean = balancedValues.reduce((a, b) => a + b) / balancedValues.length
    const balancedVariance = balancedValues.reduce((a, b) => a + Math.pow(b - balancedMean, 2), 0) / balancedValues.length
    const balancedStdDev = Math.sqrt(balancedVariance)
    
    return currentStdDev < balancedStdDev ? company : mostBalanced
  }, companies.value[0])
})

/* 当前日期 */
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
})

/* 导出 PNG */
const svgRef = ref(null)

function exportPNG() {
  const svg = svgRef.value
  if (!svg) return
  
  const bboxW = chartType.value === 'stack' ? chartWidth.value : radarSize
  const bboxH = chartType.value === 'stack' ? chartHeight.value : radarSize
  
  const xml = new XMLSerializer().serializeToString(svg)
  const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
  
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = bboxW
    canvas.height = bboxH
    const ctx = canvas.getContext('2d')
    
    // 白色背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, bboxW, bboxH)
    
    // 添加阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    
    // 绘制图表
    ctx.drawImage(img, 0, 0)
    
    // 添加水印
    ctx.font = '16px Arial'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.textAlign = 'right'
    ctx.fillText('科技公司经验分布分析', bboxW - 20, bboxH - 20)
    
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = chartType.value === 'stack' 
      ? `科技公司经验分布-堆叠柱状图-${currentDate.value.replace(/[: ]/g, '-')}.png` 
      : `科技公司经验分布-雷达图-${currentDate.value.replace(/[: ]/g, '-')}.png`
    a.click()
  }
  img.src = svg64
}

/* 刷新数据 */
function refreshData() {
  // 这里可以添加数据刷新逻辑
  console.log('刷新数据...')
  // 模拟数据更新
  const newData = [...props.data]
  // 随机更新一些数据
  newData.forEach(company => {
    if (Math.random() > 0.7) {
      Object.keys(company.dist).forEach(key => {
        company.dist[key] = Math.min(100, Math.max(0, company.dist[key] + Math.floor(Math.random() * 6) - 2))
      })
    }
  })
  // 注意：这里只是示例，实际应用中应该通过props或store更新数据
  console.log('数据已刷新', newData)
}

/* 切换主题 */
const isDarkTheme = ref(false)

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
  if (isDarkTheme.value) {
    document.documentElement.style.setProperty('--bg-color', '#1f2937')
    document.documentElement.style.setProperty('--text-color', '#f9fafb')
    document.documentElement.style.setProperty('--card-bg', '#374151')
  } else {
    document.documentElement.style.setProperty('--bg-color', '#ffffff')
    document.documentElement.style.setProperty('--text-color', '#1f2937')
    document.documentElement.style.setProperty('--card-bg', '#ffffff')
  }
}
</script>

<style scoped>
.exp-pro-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  transition: all 0.3s ease;
}

/* KPI 区 */
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi {
  border-radius: 16px;
  padding: 24px;
  background: white;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.kpi:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.kpi-primary {
  border-left: 4px solid #60a5fa;
}

.kpi-secondary {
  border-left: 4px solid #fb7185;
}

.kpi-tertiary {
  border-left: 4px solid #34d399;
}

.kpi-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.kpi-primary .kpi-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.kpi-secondary .kpi-icon {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #ec4899;
}

.kpi-tertiary .kpi-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #10b981;
}

.kpi-content {
  flex: 1;
}

.kpi-title {
  font-size: 15px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.kpi-value {
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
  line-height: 1;
}

.kpi-sub {
  font-size: 13px;
  color: #94a3b8;
}

.spark {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0.7;
}

/* 主内容区 */
.main-content {
  margin-top: 30px;
}

/* 头部控制区 */
.header {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.title-section {
  flex: 1;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 14px;
  color: #475569;
  font-weight: 600;
}

.styled-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
  min-width: 180px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.styled-select:hover {
  border-color: #cbd5e1;
}

.styled-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.company-select {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.toggle-buttons {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}

.toggle-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-export {
  padding: 14px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.btn-icon {
  flex-shrink: 0;
}

/* 图例区 */
.legend-section {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  border: 1px solid #f1f5f9;
}

.legend-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.legend-item.off {
  opacity: 0.4;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.legend-percentage {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 600px;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  margin-bottom: 24px;
  overflow: hidden;
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.radar-chart {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.bar-hit-area {
  cursor: pointer;
}

.bar-hit-area:hover {
  opacity: 0.1;
}

.segment {
  transition: all 0.3s ease;
  cursor: pointer;
}

.segment:hover {
  opacity: 1 !important;
  filter: brightness(1.1);
}

.total-label {
  pointer-events: none;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

/* 信息面板 */
.info-panel {
  background: white;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #f1f5f9;
}

.ranking-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f1f5f9;
}

.rank-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.rank-col {
  background: #f8fafc;
  border-radius: 14px;
  padding: 20px;
}

.rank-header {
  margin-bottom: 20px;
}

.rank-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.rank-subtitle {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  margin-bottom: 10px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #475569;
  flex-shrink: 0;
}

.rank-name {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.rank-value {
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  flex-shrink: 0;
}

.rank-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  opacity: 0.1;
  z-index: 0;
}

.rank-item:hover {
  transform: translateX(4px);
  transition: transform 0.2s ease;
}

/* 洞察区 */
.insights-section {
  margin-top: 30px;
}

.insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.insight-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 6px;
}

.insight-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

/* 页脚 */
.footer {
  margin-top: 30px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.footer-text {
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.footer-icon {
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.footer-btn {
  padding: 10px 20px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.footer-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

/* 滚动条样式 */
.rank-list::-webkit-scrollbar {
  width: 6px;
}

.rank-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.rank-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.rank-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .chart-container {
    height: 550px;
  }
  
  .chart-svg {
    overflow: visible;
  }
}

@media (max-width: 1200px) {
  .header {
    flex-direction: column;
    gap: 20px;
  }
  
  .controls {
    width: 100%;
    justify-content: flex-start;
  }
  
  .title {
    font-size: 24px;
  }
  
  .kpi-value {
    font-size: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-container {
    height: 500px;
  }
  
  .chartWidth {
    width: 1000px;
  }
  
  .rank-cols {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .exp-pro-card {
    padding: 16px;
  }
  
  .kpis {
    grid-template-columns: 1fr;
  }
  
  .kpi {
    padding: 20px;
  }
  
  .kpi-value {
    font-size: 28px;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    width: 100%;
  }
  
  .styled-select {
    min-width: 0;
    width: 100%;
  }
  
  .toggle-buttons {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    text-align: center;
  }
  
  .chart-container {
    height: 450px;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .insights {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 20px;
  }
  
  .kpi {
    flex-direction: column;
    gap: 16px;
  }
  
  .kpi-icon {
    width: 48px;
    height: 48px;
  }
  
  .btn-export {
    justify-content: center;
  }
  
  .chart-container {
    height: 400px;
  }
  
  .insights {
    grid-template-columns: 1fr;
  }
  
  .footer-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .footer-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 打印样式 */
@media print {
  .exp-pro-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
  
  .btn-export,
  .footer-btn {
    display: none;
  }
}
</style>