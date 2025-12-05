<template>  
  <div class="layout">
    <!-- 左侧导航栏：大块 + 可展开子块 -->
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
        <!-- 每个大块 -->
        <div
          v-for="group in mainNavItems"
          :key="group.key"
          class="nav-group"
        >
          <!-- 大标题按钮 -->
          <button
            class="nav-item nav-main"
            :class="{ active: activeMain === group.key }"
            @click="toggleMain(group.key)"
          >
            <span>{{ group.label }}</span>

            <!-- 只有有子项的才显示小箭头 -->
            <span
              v-if="group.children && group.children.length"
              class="nav-arrow"
              :class="{ open: openMain === group.key }"
            >
              ▾
            </span>
          </button>

          <!-- 展开的子标题列表（只有 jobFactors / happiness 才有） -->
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

    <!-- 右侧内容区 -->
    <main class="content">
      <header class="content-header">
        <h1>{{ currentTitle }}</h1>
        <p class="content-subtitle">
          {{ currentSubtitle }}
        </p>
      </header>

      <section class="content-body">
        <!-- 1. 公司&城市概览（无子项，直接展示城市分布这一页） -->
        <div v-if="activeMain === 'companyIntro'">
          <h2>城市分布 & 能级对比</h2>
          <p>
            统计 9 家互联网大厂在不同城市的岗位数量分布，按照一线 / 新一线 / 二线城市进行划分，
            观察哪些城市是大厂“主战场”，哪些城市是正在崛起的新机会。
          </p>
          <p class="hint">
            图形设计：
            · 中国地图 + 气泡 / 热力图（岗位数）
            · 条形图：城市岗位 Top10，分公司对比占比。
          </p>
          <CityDistribution />
        </div>

        <!-- 2. 求职维度分析：2/3/4/5/7/8/9（需要看 activeSub） -->
        <!-- 2.1 薪资区间分布（按公司对比） -->
        <div v-else-if="activeMain === 'jobFactors' && activeSub === 'salaryDist'">
          <h2>薪资区间分布（按公司对比）</h2>
          <p>
            对比各大厂在不同薪资档位（如 10-15k、15-20k、20-30k 等）的岗位数量，
            同时观察每家公司的中位数、上下四分位和极值，看看谁是真正的“薪资高地”。
          </p>
          <p class="hint">
            图形设计：
            · 分箱柱状图 / 堆叠柱状图（公司 × 薪资区间）
            · 箱线图：对比 9 家大厂的中位数和波动区间。
          </p>
          <CompanySalaryCompare />
          <div style="height: 420px; margin-top: 16px; border-radius: 14px; overflow: hidden; background: #fff;">
            <CoinIncome />
          </div>
        </div>

        <!-- 2.2 学历要求对比 -->
        <div v-else-if="activeMain === 'jobFactors' && activeSub === 'eduRequirements'">
          <h2>学历要求对比（本科 / 硕士 / 博士 / 大专）</h2>
          <p>
            分析不同公司在学历要求上的“卷度”：本科、硕士、博士、大专各占多大比例，
            哪些公司对高学历依赖更强，哪些公司对本科生更友好。
          </p>
          <p class="hint">
            图形设计：
            · 堆叠条形图：公司在 x 轴，学历占比在 y 轴
            · 雷达图：每家公司一个雷达，维度是不同学历比例。
          </p>
          <div class="placeholder-card">
            这里预留学历要求可视化组件（EducationRequirementChart）。
          </div>
        </div>

        <!-- 2.3 岗位类型结构 -->
        <div v-else-if="activeMain === 'jobFactors' && activeSub === 'roleStructure'">
          <h2>岗位类型结构（研发 / 产品 / 运营 / 市场 / 职能）</h2>
          <p>
            不同大厂的岗位结构差异很大：有的研发占比极高，有的运营与市场岗位更多。
            这一部分帮助同学判断：自己的目标岗位在每家公司中大概处于什么“权重”。
          </p>
          <p class="hint">
            图形设计：
            · 环形图/玫瑰图：单公司内部岗位结构
            · 分组条形图：对比 9 家大厂的“研发岗位占比”等。
          </p>
          <div class="placeholder-card">
            这里预留岗位结构可视化组件（RoleStructureChart）。
          </div>
        </div>

        <!-- 2.4 工作经验要求分布 -->
        <div v-else-if="activeMain === 'jobFactors' && activeSub === 'expRequirements'">
          <h2>工作经验要求分布（应届 / 1-3 年 / 3-5 年 / 5 年以上）</h2>
          <p>
            统计每家公司的不同经验段需求比例，看看应届生岗位在整体中占多大权重，
            哪些公司更偏好“有经验的社招”，哪些公司对应届生更友好。
          </p>
          <p class="hint">
            图形设计：
            · 堆叠条形图：公司 vs 经验段比例
            · 雷达图：公司对不同经验层级的需求强度。
          </p>
          <div class="placeholder-card">
            这里预留经验要求可视化组件（ExperienceRequirementChart）。
          </div>
        </div>

        <!-- 2.5 校招 vs 社招 岗位比例 -->
        <div v-else-if="activeMain === 'jobFactors' && activeSub === 'campusVsSocial'">
          <h2>校招 vs 社招 岗位比例</h2>
          <p>
            区分招聘类型（校招 / 社招 / 实习），衡量各大厂对学生群体的“友好度”，
            也可以观察不同月份校招岗位的变化趋势。
          </p>
          <p class="hint">
            图形设计：
            · 堆叠条形图：公司 vs 校招 / 社招 / 实习占比
            · 时间轴折线：校招岗位数量随时间的变化。
          </p>
          <div class="placeholder-card">
            这里预留校招/社招比例可视化组件（CampusSocialChart）。
          </div>
        </div>

        <!-- 2.6 技术栈 / 技能关键词 -->
        <div v-else-if="activeMain === 'jobFactors' && activeSub === 'techStack'">
          <h2>技术栈 / 技能关键词可视化</h2>
          <p>
            针对技术岗 JD 做分词，统计最常出现的编程语言与技术关键词，
            比如 Java / C++ / Python / Go，以及大数据 / 算法 / 分布式 / 微服务 / 云原生等。
          </p>
          <p class="hint">
            图形设计：
            · 技术栈词云：每家公司一张
            · 雷达图或条形图：对比各家公司对关键技能的需求强度。
          </p>
          <div class="placeholder-card">
            这里预留技能词云与技能强度图组件（TechStackWordCloud / SkillDemandChart）。
          </div>
        </div>

        <!-- 2.7 薪资 vs 学历/经验 -->
        <div v-else-if="activeMain === 'jobFactors' && activeSub === 'salaryVsEduExp'">
          <h2>薪资与学历 / 经验的关系（门槛 & 天花板）</h2>
          <p>
            对比在同一家公司中，本科 vs 硕士的平均薪资差距，以及 1-3 年、3-5 年、5 年以上
            不同经验段的薪资提升幅度，展示学历与经验在“门槛”和“天花板”上的影响。
          </p>
          <p class="hint">
            图形设计：
            · 分组条形图：同公司，不同学历的平均薪资
            · 折线图：随着年限提升的平均薪资曲线。
          </p>
          <div class="placeholder-card">
            这里预留薪资 vs 学历/经验可视化组件（SalaryEduExpChart）。
          </div>
        </div>

        <!-- 3. 工作幸福感：6/10/11 -->
        <!-- 3.1 加班强度 -->
        <div v-else-if="activeMain === 'happiness' && activeSub === 'overtimeIntensity'">
          <h2>“加班强度” / 工作强度标签可视化</h2>
          <p>
            基于 JD 文本中的关键词（如「加班」「大小周」「弹性工作」「高强度」等），
            估算每家公司疑似 996 岗位的占比，从文本侧刻画用工文化与工作强度。
          </p>
          <p class="hint">
            图形设计：
            · 条形图：各公司“疑似 996 岗位占比”
            · 词云：高频的用工相关关键词（弹性、奋斗、快节奏、压力大等）。
          </p>
          <div class="placeholder-card">
            这里预留工作强度可视化组件（OvertimeIntensityChart / WorkloadWordCloud）。
          </div>
        </div>

        <!-- 3.2 城市生活成本 vs 薪资 -->
        <div v-else-if="activeMain === 'happiness' && activeSub === 'cityCostVsSalary'">
          <h2>城市生活成本 vs 实际薪资（性价比城市）</h2>
          <p>
            结合城市等级、租房均价等公开信息，用“平均月薪 / 参考房租”构造一个粗略的
            「打工性价比指数」，对比在不同城市就职同一家公司时，哪座城市更“值”。
          </p>
          <p class="hint">
            图形设计：
            · 散点图：x = 生活成本 / 租金，y = 平均薪资
            · 排名条形图：大厂工作最“划算”的城市 Top10。
          </p>
          <div class="placeholder-card">
            这里预留城市性价比可视化组件（CityValueIndexChart）。
          </div>
        </div>

        <!-- 3.3 福利标签 / 企业文化 -->
        <div v-else-if="activeMain === 'happiness' && activeSub === 'welfareCulture'">
          <h2>福利标签 / 企业文化关键词可视化</h2>
          <p>
            从福利与企业文化描述字段中提取关键词，例如「五险一金」「年终奖」「期权」
            「免费三餐」「房补」「弹性打卡」「带薪病假」等，看看哪家更强调福利，
            哪家更偏“硬核绩效导向”。
          </p>
          <p class="hint">
            图形设计：
            · 词云：福利相关高频关键词
            · 堆叠条形图：公司 vs 某类福利的出现比例（如“期权/股票”相关岗位占比）。
          </p>
          <div class="placeholder-card">
            这里预留福利与文化可视化组件（BenefitWordCloud / BenefitRatioChart）。
          </div>
        </div>

        <!-- 4. 综合推荐排名（无子项） -->
        <div v-else-if="activeMain === 'ranking'">
          <h2>综合推荐排名</h2>
          <p>
            综合前面关于收入、学历/经验要求、技术栈匹配、工作强度、城市性价比、福利与稳定性的分析，
            为每家公司构造一个面向应届生的综合评分，并给出推荐排序。
          </p>
          <p class="hint">
            可设计若干种权重方案（例如「高薪优先」「生活优先」「平衡型」），
            让用户切换不同偏好，查看对应的排名变化。
          </p>
          <div class="placeholder-card">
            这里预留综合评分与排名组件（CompanyRankingChart + AI 解读文案）。
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CompanySalaryCompare from './components/CompanySalaryCompare.vue'
import CityDistribution from './components/CityDistribution.vue'
import CoinIncome from './components/CoinIncome.vue'

const activeMain = ref('companyIntro')     // 当前选中的大块
const activeSub = ref('salaryDist')        // 当前选中的小块（仅用于有子项的两个大块）
const openMain = ref('jobFactors')         // 当前展开子项的哪个大块（默认展开求职维度）

// 大块 + 子块结构：1 和 4 没有 children
const mainNavItems = [
  {
    key: 'companyIntro',
    label: '公司&城市概览',
    children: []             // 没有子项
  },
  {
    key: 'jobFactors',
    label: '求职维度分析',
    children: [
      { key: 'salaryDist',      label: '薪资区间分布（按公司）' },
      { key: 'eduRequirements', label: '学历要求对比' },
      { key: 'roleStructure',   label: '岗位类型结构' },
      { key: 'expRequirements', label: '工作经验要求分布' },
      { key: 'campusVsSocial',  label: '校招 vs 社招比例' },
      { key: 'techStack',       label: '技术栈 / 技能关键词' },
      { key: 'salaryVsEduExp',  label: '薪资 vs 学历/经验' }
    ]
  },
  {
    key: 'happiness',
    label: '工作幸福感',
    children: [
      { key: 'overtimeIntensity', label: '加班强度 / 工作强度' },
      { key: 'cityCostVsSalary',  label: '城市生活成本 vs 薪资' },
      { key: 'welfareCulture',    label: '福利标签 / 企业文化' }
    ]
  },
  {
    key: 'ranking',
    label: '综合推荐排名',
    children: []            // 没有子项
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
    // 有子项：切换展开 / 折叠
    openMain.value = openMain.value === key ? '' : key
    // 默认选中该组的第一个子项
    activeSub.value = group.children[0].key
  } else {
    // 没有子项：不显示子列表
    // openMain 保持原样（这样 jobFactors / happiness 的展开状态不受影响）
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

/* 左侧导航 */
.sidebar {
  width: 300px; /* 稍微变宽一点，让内容更饱满 */
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 28px 22px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  margin-bottom: 26px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.brand-logo {
  width: 75px;   /* logo 放大 */
  height: 75px;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
  padding: 3px;
  background: linear-gradient(135deg, #4f46e5, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo img {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  display: block;
}

.brand-text {
  margin-left: 14px;
}

.brand-title {
  font-size: 22px;   /* 标题更大 */
  font-weight: 700;
}

.brand-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.nav {
  margin: 18px 0;
  flex: 1;
  overflow-y: auto;
}

.nav-group + .nav-group {
  margin-top: 6px;
}

.nav-item {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;        /* 原来 15px → 整体大一号 */
  color: #111827;         /* 换成接近纯黑的颜色 */
}

/* 大标题按钮：更高一点、看起来更“块” */
.nav-main {
  padding: 14px 16px;     /* 原来 12x14 → 高一点宽一点 */
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;       /* 大标题加粗一点 */
}

.nav-main:hover {
  background: #f3f4f6;
}

.nav-main.active {
  background: #e5e7eb;
  color: #111827;
}

/* 展开的子项列表 */
.nav-sub-list {
  margin-top: 4px;
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 1px solid #e5e7eb;
}

.nav-sub {
  padding: 9px 14px;      /* 原来 7x11 → 高一点 */
  margin: 4px 0;
  border-radius: 999px;
  font-size: 15px;        /* 比原来 14px 大一点 */
  color: #111827;         /* 也用深色文字 */
}

.nav-sub:hover {
  background: #f3f4f6;
}

.nav-sub.active {
  background: #e5e7eb;
  color: #111827;
}

/* 小箭头 */
.nav-arrow {
  font-size: 20px;
  transition: transform 0.15s ease;
}

.nav-arrow.open {
  transform: rotate(180deg);
}

.sidebar-footer {
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
}

.footer-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.footer-text {
  line-height: 1.6;
}

/* 右侧内容区 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 18px 26px 14px;
}

.content-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.content-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.content-body {
  padding: 22px 26px 26px;
}

.content-body h2 {
  margin-top: 0;
  font-size: 19px;
  margin-bottom: 10px;
}

.content-body p {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
}

.hint {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
}

.placeholder-card {
  margin-top: 12px;
  padding: 18px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  font-size: 13px;
  color: #6b7280;
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
}
</style>
