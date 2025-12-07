<template>  
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo">
          <img src="/src/assets/996-worker.png" alt="996-Explorer Logo" />
        </div>
        <div class="brand-text">
          <div class="brand-title">996-Explorer</div>
          <div class="brand-subtitle">大厂就业可视化</div>
        </div>
      </div>

      <nav class="nav">
        <div
          v-for="group in mainNavItems"
          :key="group.key"
          class="nav-group"
        >
          <button
            class="nav-item nav-main"
            :class="{ active: activeMain === group.key }"
            @click="toggleMain(group.key)"
          >
            <span>{{ group.label }}</span>
            <span
              v-if="group.children && group.children.length"
              class="nav-arrow"
              :class="{ open: openMain === group.key }"
            >
              ▾
            </span>
          </button>

          <div
            v-if="group.children && group.children.length && openMain === group.key"
            class="nav-sub-list"
          >
            <button
              v-for="sub in group.children"
              :key="sub.key"
              class="nav-item nav-sub"
              :class="{ active: activeSub === sub.key && activeMain === group.key }"
              @click="selectSub(group.key, sub.key)"
            >
              {{ sub.label }}
            </button>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="footer-title">说明</div>
        <p class="footer-text">
          数据来自招聘平台小样本采样 / 公开数据集，仅用于课程可视化作业分析。
        </p>
      </div>
    </aside>

    <main class="content">
      <header class="content-header">
        <h1>{{ currentTitle }}</h1>
        <p class="content-subtitle">
          {{ currentSubtitle }}
        </p>
      </header>

      <section class="content-body">
        
        <template v-if="activeMain === 'companyIntro'">
          <div v-if="activeSub === 'companyBasic'">
            <h2>大厂基本信息一览</h2>
            <p>
              从总部城市、核心业务、典型应届薪资、主要办公城市和文化氛围几个维度，
              快速感受 9 家互联网大厂的大致画像。
            </p>
            <CompanyBasicInfo />
          </div>

          <div v-else-if="activeSub === 'cityDist'">
            <h2>城市分布 & 能级对比</h2>
            <p>
              统计 9 家互联网大厂在不同城市的岗位数量分布，按照一线 / 新一线 / 二线城市进行划分。
            </p>
            <CityDistribution />
          </div>
        </template>

        <template v-else-if="activeMain === 'jobFactors'">
          <div v-if="activeSub === 'salaryDist'">
            <h2>薪资区间分布</h2>
            <p>
              对比各大厂在不同薪资档位（如 10-15k、15-20k 等）的岗位数量与金币堆积模拟。
            </p>
            <CompanySalaryCompare />
            <div style="height: 420px; margin-top: 16px; border-radius: 14px; overflow: hidden; background: #fff;">
              <CoinIncome />
            </div>
          </div>

          <div v-else-if="activeSub === 'techStack'">
            <h2>技术栈 / 技能星云图谱</h2>
            <p>
              基于招聘 JD 数据聚类分析，展示计算机专业技能的关联与生态，点击节点可查看详情。
            </p>
            <TechStackView />
          </div>

          <div v-else-if="activeSub === 'eduRequirements'">
            <h2>学历要求对比</h2>
            <EducationRequirementChart />
          </div>

          <div v-else-if="activeSub === 'roleStructure'">
            <h2>岗位类型结构</h2>
            <RoleStructureChart />
          </div>

          <div v-else-if="activeSub === 'expRequirements'">
            <h2>工作经验要求分布</h2>
            <ExperienceRequirementChart />
          </div>

          <div v-else-if="activeSub === 'campusVsSocial'">
            <h2>校招 vs 社招 岗位比例</h2>
            <CampusSocialChart />
          </div>

          <div v-else-if="activeSub === 'salaryVsEduExp'">
            <h2>薪资与学历 / 经验的关系</h2>
            <p>
              基于真实样本数据，分析“学历门槛”与“工作年限”对薪资的具体影响。
            </p>
            <SalaryEduBackground />
          </div>
        </template>

        <template v-else-if="activeMain === 'happiness'">
          <div v-if="activeSub === 'overtimeIntensity'">
            <h2>“加班强度”分析</h2>
            <OvertimeIntensityChart />
          </div>

          <div v-else-if="activeSub === 'cityCostVsSalary'">
            <h2>城市生活成本 vs 实际薪资</h2>
            <p>
              结合城市等级、租房均价等公开信息，计算「平均月薪 - 生活成本」的盈余情况。
            </p>
            <div style="height: 600px; margin-top: 16px; border-radius: 12px; overflow: hidden;">
              <SalaryCostMap />
            </div>
          </div>

          <div v-else-if="activeSub === 'welfareCulture'">
            <h2>福利标签 / 企业文化</h2>
            <BenefitWordCloud />
          </div>
        </template>

        <div v-else-if="activeMain === 'ranking'">
          <h2>综合推荐排名</h2>
          <div class="placeholder-card">这里预留综合评分与排名组件。</div>
        </div>

      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// --- 引入组件 ---
import CompanySalaryCompare from './components/CompanySalaryCompare.vue' // 原有的薪资区间图
import SalaryEduBackground from './components/SalaryEduBackground.vue'     // 新增的学历经验图
import CityDistribution from './components/CityDistribution.vue'
import CoinIncome from './components/CoinIncome.vue'
import CompanyBasicInfo from './components/CompanyBasicInfo.vue'
import EducationRequirementChart from './components/EducationRequirementChart.vue'
import ExperienceRequirementChart from './components/ExperienceRequirementChart.vue'
import RoleStructureChart from './components/RoleStructureChart.vue'
import CampusSocialChart from './components/CampusSocialChart/CampusSocialChart.vue'
import TechStackView from './components/TechStackView.vue'
import OvertimeIntensityChart from './components/OvertimeIntensityChart.vue'
import BenefitWordCloud from './components/BenefitWordCloud.vue'
import SalaryCostMap from './components/SalaryCostMap.vue' 

// 状态管理
const activeMain = ref('jobFactors')        
const activeSub = ref('salaryVsEduExp')  // 默认定位到新图表
const openMain = ref('jobFactors')

// 导航配置
const mainNavItems = [
  {
    key: 'companyIntro',
    label: '大厂基本信息认知',
    children: [
      { key: 'companyBasic', label: '大厂简介说明' },
      { key: 'cityDist',     label: '所在城市分布' }
    ]
  },
  {
    key: 'jobFactors',
    label: '求职维度分析',
    children: [
      { key: 'salaryDist',      label: '薪资区间分布' }, // 这里显示 CompanySalaryCompare + CoinIncome
      { key: 'techStack',       label: '技能星云图谱' },
      { key: 'eduRequirements', label: '学历要求对比' },
      { key: 'roleStructure',   label: '岗位类型结构' },
      { key: 'expRequirements', label: '工作经验要求' },
      { key: 'campusVsSocial',  label: '校招 vs 社招' },
      { key: 'salaryVsEduExp',  label: '薪资 vs 经验' }  // 这里显示 SalaryEduExpChart
    ]
  },
  {
    key: 'happiness',
    label: '工作幸福感',
    children: [
      { key: 'cityCostVsSalary',  label: '城市性价比' },
      { key: 'overtimeIntensity', label: '加班强度' },
      { key: 'welfareCulture',    label: '福利与文化' }
    ]
  },
  {
    key: 'ranking',
    label: '综合推荐排名',
    children: []
  }
]

const currentTitle = computed(() => {
  const map = {
    companyIntro: '公司与城市整体概览',
    jobFactors:   '求职关键维度分析',
    happiness:    '工作幸福感与风险',
    ranking:      '综合推荐与大厂排序'
  }
  return map[activeMain.value] || '996-Explorer'
})

const currentSubtitle = computed(() => {
  const map = {
    companyIntro: '先从公司分布与城市能级，看看互联网大厂的“基本盘”。',
    jobFactors:   '收入、学历门槛、经验要求与技术栈，是求职时最在意的硬指标。',
    happiness:    '结合工作强度、城市生活成本与福利，估一估真实的打工幸福度。',
    ranking:      '在前面分析基础上，为应届生给出一个可解释的综合推荐排序。'
  }
  return map[activeMain.value] || ''
})

function toggleMain(key) {
  activeMain.value = key
  const group = mainNavItems.find(g => g.key === key)
  if (group && group.children && group.children.length) {
    openMain.value = openMain.value === key ? '' : key
    activeSub.value = group.children[0].key
  }
}

function selectSub(mainKey, subKey) {
  activeMain.value = mainKey
  openMain.value = mainKey
  activeSub.value = subKey
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  background: #f5f5f5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
}

.sidebar {
  width: 300px; /* 稍微加宽一点，让大字号不显得挤 */
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  padding-bottom: 22px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e5e7eb;
  padding-left: 8px;
}

.brand-logo {
  width: 80px;       /* ✅ logo 放大 */
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-text {
  margin-left: 14px;
}

.brand-title {
  font-size: 22px;   /* ✅ 标题字号变大 */
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.02em;
}

.brand-subtitle {
  margin-top: 4px;
  font-size: 18px;   /* ✅ 副标题略放大 */
  color: #6b7280;
}

/* 导航区整体字号稍微上调 */
.nav {
  flex: 1;
  overflow-y: auto;
  margin-top: 4px;
}

.nav-group {
  margin-bottom: 6px;
}

.nav-item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #374151;
  font-size: 19px;   /* ✅ 导航主字体变大 */
}

.nav-main {
  padding: 14px 12px; /* 稍微加大内边距 */
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-main:hover {
  background: #f3f4f6;
}

.nav-main.active {
  background: #eff6ff;
  color: #2563eb;
}

.nav-arrow {
  font-size: 13px;
  transition: transform 0.2s;
}
.nav-arrow.open {
  transform: rotate(180deg);
}

.nav-sub-list {
  margin-top: 4px;
  padding-left: 14px;
}

.nav-sub {
  padding: 12px 20px;           /* ✅ 子项 padding + 字号加大 */
  border-radius: 8px;
  margin-bottom: 2px;
  font-size: 18px;
}

.nav-sub:hover {
  background: #f9fafb;
  color: #111827;
}

.nav-sub.active {
  background: #e0e7ff;
  color: #4338ca;
  font-weight: 600;
}

/* 底部说明字体也稍微拉大一点，不那么“迷你” */
.sidebar-footer {
  margin-top: auto;
  padding-top: 22px;
  border-top: 1px solid #e5e7eb;
  font-size: 13px;
  color: #9ca3af;
  padding-left: 8px;
}

.footer-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #6b7280;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  background: #fff;
  padding: 26px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.content-header h1 {
  margin: 0;
  font-size: 24px;
  color: #111827;
}

.content-subtitle {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.content-body {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
}

.content-body h2 {
  font-size: 20px;
  margin-top: 0;
  margin-bottom: 12px;
  color: #1f2937;
}

.content-body p {
  color: #4b5563;
  margin-bottom: 20px;
  line-height: 1.6;
}

.placeholder-card {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: #9ca3af;
}

.data-source-note {
  margin-top: 24px;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
