<template>
  <div class="chart-container">
    <!-- 工时对比条形图 -->
    <div class="chart-section">
      <h3>各大厂周平均工时对比</h3>
      <div class="chart-wrapper">
        <v-chart :option="overtimeOption" autoresize class="chart" />
      </div>
      <div class="chart-note">
        数据来源：2025年大厂工时排行榜，纵坐标从50小时开始以突显差异
      </div>
    </div>

    <!-- 加班强度多维度对比 -->
    <div class="chart-section">
      <h3>加班强度多维度对比</h3>
      <div class="chart-wrapper">
        <v-chart :option="overtimeDetailOption" autoresize class="chart" />
      </div>
      <div class="chart-note">
        从四个维度综合评估加班强度：平均下班时间、周末加班、年假使用率、员工满意度
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="data-table-section">
      <h3>详细加班数据</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>公司</th>
            <th>周工时(h)</th>
            <th>平均下班时间</th>
            <th>周末加班(天/月)</th>
            <th>年假使用率</th>
            <th>员工满意度</th>
            <th>强度分数</th>
            <th>加班文化描述</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in overtimeDetailData" :key="item.company">
            <td class="company-name">{{ item.company }}</td>
            <td class="hours">{{ findWeeklyHours(item.company) }}</td>
            <td :style="{ color: getTimeColor(item.avgLeaveTime) }">{{ formatTime(item.avgLeaveTime) }}</td>
            <td :style="{ color: getWeekendColor(item.weekendDays) }">{{ item.weekendDays }}</td>
            <td :style="{ color: getUsageColor(item.annualLeaveUsage) }">{{ (item.annualLeaveUsage * 100).toFixed(0) }}%</td>
            <td :style="{ color: getSatisfactionColor(item.satisfaction) }">{{ item.satisfaction.toFixed(1) }}/10</td>
            <td :style="{ color: getScoreColor(item.overtimeScore) }">{{ item.overtimeScore.toFixed(1) }}/5</td>
            <td class="description">{{ item.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { overtimeData } from '../data/companies.js'
import { overtimeDetailData, formatTime, getScoreColor } from '../data/overtimeDetail.js'

// 找到原数据中的周工时
const findWeeklyHours = (company) => {
  const item = overtimeData.find(d => d.company === company)
  return item ? item.hours : '-'
}

// 颜色辅助函数
const getTimeColor = (time) => {
  if (time >= 22) return '#ff4757'
  if (time >= 21) return '#ff6b81'
  if (time >= 20.5) return '#ff9f43'
  if (time >= 20) return '#feca57'
  return '#1dd1a1'
}

const getWeekendColor = (days) => {
  if (days >= 6) return '#ff4757'
  if (days >= 4) return '#ff6b81'
  if (days >= 2) return '#ff9f43'
  return '#1dd1a1'
}

const getUsageColor = (usage) => {
  if (usage <= 0.4) return '#ff4757'
  if (usage <= 0.6) return '#ff9f43'
  if (usage <= 0.8) return '#feca57'
  return '#1dd1a1'
}

const getSatisfactionColor = (score) => {
  if (score >= 8) return '#1dd1a1'
  if (score >= 6) return '#48dbfb'
  if (score >= 4) return '#feca57'
  return '#ff6b81'
}

// 工时条形图配置
const overtimeOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const data = params[0]
      const item = overtimeData.find(d => d.company === data.name)
      return `
        <div style="font-weight: bold; margin-bottom: 8px;">${data.name}</div>
        <div>周工时: <strong>${data.value}h</strong></div>
        <div>日均工时: ${item.dailyHours}h</div>
        <div>强度等级: ${item.intensity}</div>
        <div>强度标签: ${item.tag}</div>
      `
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: overtimeData.map(d => d.company),
    axisLabel: {
      rotate: 45,
      fontSize: 12
    }
  },
  yAxis: {
    type: 'value',
    name: '周工时(h)',
    min: 50,  // 关键修改：从50开始，突出差异
    max: 65,  // 适当扩大范围
    interval: 2,  // 每2小时一个刻度
    nameTextStyle: {
      fontSize: 12
    },
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        color: '#e5e7eb'
      }
    }
  },
  series: [{
    name: '周工时',
    type: 'bar',
    data: overtimeData.map(d => ({
      value: d.hours,
      dailyHours: d.dailyHours,
      intensity: d.intensity,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: getBarColor(d.intensity) },
            { offset: 1, color: getBarColor(d.intensity) + 'CC' }
          ]
        },
        borderRadius: [6, 6, 0, 0],
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 4,
        shadowOffsetY: 2
      }
    })),
    label: {
      show: true,
      position: 'top',
      fontSize: 12,
      fontWeight: 'bold',
      formatter: '{c}h'
    }
  }]
}))

// 根据强度等级获取颜色
const getBarColor = (intensity) => {
  const colors = {
    '极高': '#ff4757',
    '高': '#ff6b81',
    '偏高': '#ff9f43',
    '中等偏高': '#feca57',
    '中等': '#48dbfb',
    '偏低': '#1dd1a1'
  }
  return colors[intensity] || '#8395a7'
}

// 加班强度多维度图表
// 加班强度多维度图表 - 简化版柱状图
const overtimeDetailOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['平均下班时间', '周末加班天数', '年假使用率'],
    top: '5%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: overtimeDetailData.map(d => d.company),
    axisLabel: {
      rotate: 45,
      fontSize: 11
    }
  },
  yAxis: {
    type: 'value',
    name: '评分/天数'
  },
  series: [
    {
      name: '平均下班时间',
      type: 'bar',
      barWidth: '20%',
      itemStyle: {
        color: '#3498db'
      },
      data: overtimeDetailData.map(d => d.avgLeaveTime)
    },
    {
      name: '周末加班天数',
      type: 'bar',
      barWidth: '20%',
      itemStyle: {
        color: '#e74c3c'
      },
      data: overtimeDetailData.map(d => d.weekendDays)
    },
    {
      name: '年假使用率',
      type: 'bar',
      barWidth: '20%',
      itemStyle: {
        color: '#2ecc71'
      },
      data: overtimeDetailData.map(d => d.annualLeaveUsage * 100)
    }
  ]
}))</script>

<style scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
}

.chart-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
}

.chart-wrapper {
  height: 400px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

.chart-note {
  margin-top: 12px;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}

.data-table-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
}

.data-table-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  color: #4b5563;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.data-table tr:hover {
  background: #f9fafb;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.company-name {
  font-weight: 600;
  color: #1f2937;
}

.hours {
  font-weight: 600;
  color: #3b82f6;
}

.description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}
</style>