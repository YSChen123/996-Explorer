<template>  
  <div class="benefit-container">
    <!-- 福利关键词条形图 -->
    <div class="chart-section">
      <h3>大厂福利关键词热度排名</h3>
      <p class="section-subtitle">展示各大厂福利提及频率最高的关键词</p>
      
      <div class="chart-wrapper">
        <v-chart :option="benefitBarOption" autoresize class="chart" />
      </div>
    </div>

    <!-- 大厂福利综合对比 -->
    <div class="chart-section">
      <h3>大厂福利综合对比</h3>
      <p class="section-subtitle">点击公司名称查看详细福利信息</p>
      
      <div class="combined-layout">
        <!-- 左侧：雷达图 + 排名列表 -->
        <div class="radar-section">
          <div class="company-selector">
            <div class="selector-header">
              <h4>选择公司查看详情</h4>
              <div
                class="score-badge"
                :style="{ backgroundColor: getScoreColor(selectedCompany.score) }"
              >
                综合得分 {{ selectedCompany.score }}/100
              </div>
            </div>

            <div class="company-buttons">
              <button
                v-for="(company, index) in sortedCompanies"
                :key="company.company"
                @click="selectCompany(company)"
                :class="['company-btn', { active: selectedCompany.company === company.company }]"
                :style="{ borderColor: getScoreColor(company.score) }"
              >
                <div class="company-btn-top">
                  <span class="company-name">
                    {{ index + 1 }}. {{ company.company }}
                  </span>
                  <span class="company-score">
                    {{ company.score }}
                  </span>
                </div>
                <div class="score-bar">
                  <div
                    class="score-bar-fill"
                    :style="{
                      width: company.score + '%',
                      backgroundColor: getScoreColor(company.score)
                    }"
                  ></div>
                </div>
              </button>
            </div>
          </div>
          
          <div class="radar-wrapper">
            <v-chart :option="radarOption" autoresize class="radar-chart" />
          </div>
        </div>

        <!-- 右侧：公司福利详情 -->
        <div class="detail-section">
          <div class="detail-header">
            <h4>{{ selectedCompany.company }} - 重点福利概览</h4>
            <div class="company-rank">
              <span class="rank-label">综合排名:</span>
              <span class="rank-value">
                第{{ getCompanyRank(selectedCompany.company) }}名
              </span>
            </div>
          </div>
          
          <div class="benefit-details">
            <div class="benefit-category">
              <h5>💰 经济福利</h5>
              <div class="benefit-items">
                <div class="benefit-item highlight">
                  <span class="item-label">年终奖:</span>
                  <span class="item-value">{{ selectedCompany.bonus }}</span>
                </div>
                <div class="benefit-item">
                  <span class="item-label">股票期权:</span>
                  <span class="item-value">{{ selectedCompany.stock ? '有' : '无' }}</span>
                </div>
                <div class="benefit-item">
                  <span class="item-label">公积金比例:</span>
                  <span class="item-value">{{ selectedCompany.fund }}%</span>
                </div>
              </div>
            </div>

            <div class="benefit-category">
              <h5>🏠 生活福利</h5>
              <div class="benefit-items">
                <div class="benefit-item highlight">
                  <span class="item-label">住房补贴:</span>
                  <span class="item-value">{{ selectedCompany.housing || '无' }}</span>
                </div>
                <div class="benefit-item">
                  <span class="item-label">餐饮福利:</span>
                  <span class="item-value">{{ selectedCompany.meal || '无' }}</span>
                </div>
                <div class="benefit-item">
                  <span class="item-label">交通补贴:</span>
                  <span class="item-value">{{ selectedCompany.transport || '无' }}</span>
                </div>
              </div>
            </div>

            <div class="benefit-category">
              <h5>⚕️ 健康保障</h5>
              <div class="benefit-items">
                <div class="benefit-item highlight">
                  <span class="item-label">带薪病假:</span>
                  <span class="item-value">{{ selectedCompany.sickLeave || '无' }}</span>
                </div>
                <div class="benefit-item">
                  <span class="item-label">补充保险:</span>
                  <span class="item-value">{{ selectedCompany.insurance ? '有' : '无' }}</span>
                </div>
              </div>
            </div>

            <div class="benefit-category">
              <h5>🎁 其他福利</h5>
              <div class="benefit-items">
                <div class="benefit-item">
                  <span class="item-label">健身房:</span>
                  <span class="item-value">{{ selectedCompany.gym || '无' }}</span>
                </div>
                <div class="benefit-item">
                  <span class="item-label">节日福利:</span>
                  <span class="item-value">{{ selectedCompany.festival || '无' }}</span>
                </div>
              </div>
            </div>
          </div> <!-- /benefit-details -->
        </div> <!-- /detail-section -->
      </div> <!-- /combined-layout -->
    </div> <!-- /chart-section -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
import {
  completeBenefits,
  benefitWords,
  getBenefitScoreColor
} from '../data/benefitComplete.js'

/** 公司按得分排序（高 → 低） */
const sortedCompanies = computed(() =>
  [...completeBenefits].sort((a, b) => b.score - a.score)
)

/** 当前选中的公司：默认选得分最高的 */
const selectedCompany = ref(sortedCompanies.value[0] || completeBenefits[0])

// 选择公司
const selectCompany = (company) => {
  selectedCompany.value = company
}

// 获取公司排名（基于排序后的数组）
const getCompanyRank = (companyName) => {
  return sortedCompanies.value.findIndex(c => c.company === companyName) + 1
}

// 评分颜色
const getScoreColor = (score) => getBenefitScoreColor(score)

// 每个福利关键词的图标表情
const benefitEmojiMap = {
  '年终奖': '💰',
  '年度体检': '🩺',
  '打车报销': '🚕',
  '免费三餐': '🍱',
  '股票期权': '📈',
  '住房补贴': '🏠',
  '带薪病假': '😷',
  '健身房': '🏋️',
  '补充保险': '🛡️',
  '零食饮料': '🥤'
}

/** 福利关键词条形图配置（去掉奖牌，只保留排名数字 + 表情） */
const benefitBarOption = computed(() => {
  // 取前10个高频福利词，并按频次降序
  const topBenefits = [...benefitWords]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  const maxVal = Math.max(...topBenefits.map(b => b.value)) || 1
  const avgVal =
    topBenefits.reduce((sum, b) => sum + b.value, 0) / topBenefits.length

  return {
    grid: {
      left: 160,   // 左边预留：名次圆点 + 表情 + 文本
      right: 70,   // 右边预留：数值 + 平均线标签
      top: 40,
      bottom: 40
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [10, 12],
      textStyle: { color: '#111827', fontSize: 13 },
      extraCssText:
        'box-shadow:0 8px 20px rgba(15,23,42,0.12);border-radius:10px;',
      formatter(params) {
        const d = params[0]
        const benefit = topBenefits[d.dataIndex]
        const rank = d.dataIndex + 1
        const emoji = benefitEmojiMap[d.name] || '🎁'
        return `
          <div style="font-size:14px;font-weight:700;margin-bottom:6px;">
            NO.${rank} · ${emoji} ${d.name}
          </div>
          <div style="font-size:12px;color:#4b5563;line-height:1.7;">
            提及频率：<b>${d.value}</b><br/>
            提供公司数：<b>${benefit.companies.length}</b> 家<br/>
            <span style="color:#6b7280;">${benefit.description}</span>
          </div>
        `
      }
    },
    xAxis: {
      type: 'value',
      name: '提及频率',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: maxVal + 5,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        margin: 8
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#e5e7eb', type: 'dashed' }
      }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: topBenefits.map(b => b.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        margin: 20,
        formatter(value, index) {
          const rank = index + 1
          const emoji = benefitEmojiMap[value] || '🎁'
          // 这里不再拼 medal，只保留 rank + emoji + 名称
          return `{rank|${rank}} {emoji|${emoji}} {name|${value}}`
        },
        rich: {
          rank: {
            color: '#4b5563',
            fontSize: 11,
            fontWeight: 700,
            backgroundColor: '#e5e7eb',
            borderRadius: 999,
            padding: [2, 0, 1, 0],
            width: 22,
            height: 18,
            align: 'center'
          },
          emoji: {
            fontSize: 14,
            padding: [0, 2, 0, 6],
            align: 'center'
          },
          name: {
            color: '#111827',
            fontSize: 13,
            padding: [0, 4, 0, 2]
          }
        }
      }
    },
    series: [
      // 背景槽
      {
        type: 'bar',
        data: topBenefits.map(() => maxVal),
        barWidth: 18,
        silent: true,
        itemStyle: {
          color: '#f3f4f6',
          borderRadius: 9
        },
        z: 1
      },
      // 真实数据条
      {
        name: '提及频率',
        type: 'bar',
        data: topBenefits.map(b => b.value),
        barWidth: 18,
        itemStyle: {
          borderRadius: 9,
          color: params => {
            const rank = params.dataIndex + 1
            // TOP3 更亮一点
            if (rank === 1) {
              return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#f97316' },
                { offset: 1, color: '#ef4444' }
              ])
            }
            if (rank === 2) {
              return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#22c55e' },
                { offset: 1, color: '#14b8a6' }
              ])
            }
            if (rank === 3) {
              return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#6366f1' },
                { offset: 1, color: '#8b5cf6' }
              ])
            }
            // 其他统一柔和渐变
            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#22c55e' }
            ])
          }
        },
        label: {
          show: true,
          position: 'right',
          distance: 4,
          formatter: '{c}',
          color: '#111827',
          fontSize: 12,
          fontWeight: 600
        },
        z: 2,
        markLine: {
          symbol: ['none', 'none'],
          lineStyle: {
            type: 'dashed',
            color: '#fb923c',
            width: 1.5
          },
          label: {
            show: true,
            formatter: `平均值 ${avgVal.toFixed(1)}`,
            position: 'end',
            distance: 6,
            offset: [0, -14],
            color: '#b45309',
            fontSize: 11,
            backgroundColor: 'rgba(254,243,199,0.96)',
            padding: [3, 8],
            borderRadius: 999
          },
          data: [{ xAxis: avgVal }]
        }
      }
    ]
  }
})

/** 雷达图配置 */
const radarOption = computed(() => {
  const radarColor = getScoreColor(selectedCompany.value.score)

  const calculateScore = (company) => {
    const economicScore = company.score * 0.3 + (company.stock ? 20 : 0)
    const housingScore = company.housing && company.housing !== '无' ? 85 : 30
    const mealScore = company.meal && company.meal !== '无' ? 90 : 40
    const healthScore =
      (company.sickLeave && company.sickLeave !== '无' ? 70 : 30) +
      (company.insurance ? 20 : 0)
    const leaveScore =
      company.sickLeave && company.sickLeave !== '无' ? 75 : 35
    const extraScore =
      (company.gym && company.gym !== '无' ? 20 : 0) +
      (company.festival && company.festival !== '无' ? 20 : 0)

    return [
      Math.min(economicScore, 100),
      Math.min(housingScore, 100),
      Math.min(mealScore, 100),
      Math.min(healthScore, 100),
      Math.min(leaveScore, 100),
      Math.min(extraScore, 100)
    ]
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: params => {
        const names = ['经济福利', '住房补贴', '餐饮福利', '健康保障', '休假制度', '附加福利']
        const values = params.value || []
        let html = `<div style="font-weight:600;margin-bottom:4px;">${params.name}</div>`
        names.forEach((n, i) => {
          html += `<div>${n}：${values[i] || 0}</div>`
        })
        return html
      }
    },
    radar: {
      radius: '70%',
      splitNumber: 4,
      indicator: [
        { name: '经济福利', max: 100 },
        { name: '住房补贴', max: 100 },
        { name: '餐饮福利', max: 100 },
        { name: '健康保障', max: 100 },
        { name: '休假制度', max: 100 },
        { name: '附加福利', max: 100 }
      ],
      axisName: {
        color: '#4b5563',
        fontSize: 12
      },
      splitArea: {
        areaStyle: {
          color: ['#f9fafb', '#eef2ff']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: calculateScore(selectedCompany.value),
            name: selectedCompany.value.company,
            areaStyle: {
              // 修复：替换 echarts.graphic.RadialGradient(...) 为对象配置
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 1,
                colorStops: [
                  { offset: 0, color: radarColor + '33' },
                  { offset: 1, color: radarColor + '11' }
                ]
              }
            },
            lineStyle: {
              color: radarColor,
              width: 2
            },
            itemStyle: {
              color: '#ffffff',
              borderColor: radarColor,
              borderWidth: 2
            },
            symbolSize: 5
          }
        ]
      }
    ]
  }
})
</script>

<style scoped>
.benefit-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  border: 1px solid #e5e7eb;
}

.chart-section h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  color: #111827;
  font-weight: 700;
}

.section-subtitle {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 13px;
  color: #6b7280;
}

.chart-wrapper {
  height: 400px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

/* 综合对比部分 */
.combined-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.radar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.company-selector {
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selector-header h4 {
  margin: 0;
  font-size: 15px;
  color: #111827;
}

.score-badge {
  padding: 4px 10px;
  border-radius: 999px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
}

.company-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.company-btn {
  background: white;
  border: 2px solid;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.18s ease;
}

.company-btn-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-name {
  font-weight: 500;
  color: #111827;
}

.company-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
  background: #f9fafb;
}

.company-btn.active {
  background: #eff6ff;
  font-weight: 600;
}

.company-score {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #111827;
}

/* 进度条 */
.score-bar {
  width: 100%;
  height: 5px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}

.radar-wrapper {
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.radar-chart {
  height: 100%;
  width: 100%;
}

/* 右侧详情部分 */
.detail-section {
  background: #f8fafc;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-header h4 {
  margin: 0;
  font-size: 16px;
  color: #111827;
  font-weight: 700;
}

.company-rank {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-label {
  font-size: 12px;
  color: #6b7280;
}

.rank-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  padding: 4px 10px;
  background: white;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
}

.benefit-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.benefit-category {
  background: white;
  border-radius: 10px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.benefit-category h5 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.benefit-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.benefit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: #f9fafb;
}

.benefit-item.highlight {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.item-label {
  font-size: 12px;
  color: #4b5563;
}

.item-value {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .combined-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .company-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .benefit-details {
    grid-template-columns: 1fr;
  }
}
</style>
