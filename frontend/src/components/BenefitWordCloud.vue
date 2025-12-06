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
        <!-- 左侧：雷达图 -->
        <div class="radar-section">
          <div class="company-selector">
            <div class="selector-header">
              <h4>选择公司查看详情</h4>
              <div class="score-badge" :style="{ backgroundColor: getScoreColor(selectedCompany.score) }">
                {{ selectedCompany.score }}/100
              </div>
            </div>
            <div class="company-buttons">
              <button
                v-for="company in completeBenefits"
                :key="company.company"
                @click="selectCompany(company)"
                :class="['company-btn', { active: selectedCompany.company === company.company }]"
                :style="{ borderColor: getScoreColor(company.score) }"
              >
                {{ company.company }}
                <span class="company-score">{{ company.score }}</span>
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
              <span class="rank-value">第{{ getCompanyRank(selectedCompany.company) }}名</span>
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { completeBenefits, benefitWords, getBenefitScoreColor } from '../data/benefitComplete.js'

// 选中的公司
const selectedCompany = ref(completeBenefits[0])

// 选择公司
const selectCompany = (company) => {
  selectedCompany.value = company
}

// 获取公司排名
const getCompanyRank = (companyName) => {
  const sortedCompanies = [...completeBenefits].sort((a, b) => b.score - a.score)
  return sortedCompanies.findIndex(c => c.company === companyName) + 1
}

// 评分颜色
const getScoreColor = (score) => {
  return getBenefitScoreColor(score)
}

// 福利关键词条形图配置
const benefitBarOption = computed(() => {
  // 取前10个高频福利词
  const topBenefits = [...benefitWords]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const data = params[0]
        const benefit = benefitWords.find(b => b.name === data.name)
        return `
          <div style="font-weight: bold; margin-bottom: 8px">${data.name}</div>
          <div>提及频率: ${data.value}</div>
          <div>提供公司数: ${benefit.companies.length}家</div>
          <div style="font-size: 12px; color: #666">${benefit.description}</div>
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
      type: 'value',
      name: '提及频率'
    },
    yAxis: {
      type: 'category',
      data: topBenefits.map(b => b.name),
      inverse: true
    },
    series: [{
      name: '提及频率',
      type: 'bar',
      data: topBenefits.map(b => ({
        name: b.name,
        value: b.value,
        itemStyle: {
          color: function() {
            const colors = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12']
            return colors[Math.floor(Math.random() * colors.length)]
          }
        }
      }))
    }]
  }
})

// 雷达图配置
const radarOption = computed(() => {
  // 计算雷达图数据
  const calculateScore = (company) => {
    const economicScore = company.score * 0.3 + (company.stock ? 20 : 0)
    const housingScore = company.housing && company.housing !== '无' ? 85 : 30
    const mealScore = company.meal && company.meal !== '无' ? 90 : 40
    const healthScore = (company.sickLeave && company.sickLeave !== '无' ? 70 : 30) + 
                       (company.insurance ? 20 : 0)
    const leaveScore = company.sickLeave && company.sickLeave !== '无' ? 75 : 35
    const extraScore = (company.gym && company.gym !== '无' ? 20 : 0) +
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
    radar: {
      indicator: [
        { name: '经济福利', max: 100 },
        { name: '住房补贴', max: 100 },
        { name: '餐饮福利', max: 100 },
        { name: '健康保障', max: 100 },
        { name: '休假制度', max: 100 },
        { name: '附加福利', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: calculateScore(selectedCompany.value),
        name: selectedCompany.value.company,
        itemStyle: {
          color: getScoreColor(selectedCompany.value.score)
        }
      }]
    }]
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-section h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  color: #1f2937;
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
  border-radius: 8px;
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
  color: #1f2937;
}

.score-badge {
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.company-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.company-btn {
  background: white;
  border: 2px solid;
  padding: 8px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.company-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.company-btn.active {
  background: #f0f9ff;
  font-weight: 600;
}

.company-score {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #f3f4f6;
}

.radar-wrapper {
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.radar-chart {
  height: 100%;
  width: 100%;
}

/* 右侧详情部分 */
.detail-section {
  background: #f8fafc;
  border-radius: 8px;
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
  color: #1f2937;
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
  color: #1f2937;
  padding: 4px 10px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.benefit-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.benefit-category {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.benefit-category h5 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 14px;
  color: #1f2937;
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
  border-radius: 6px;
  background: #f9fafb;
}

.benefit-item.highlight {
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
}

.item-label {
  font-size: 12px;
  color: #4b5563;
}

.item-value {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
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