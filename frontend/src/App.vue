<template> 
  <div class="layout">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo">9</div>
        <div class="brand-text">
          <div class="brand-title">996-Explorer</div>
          <div class="brand-subtitle">大厂就业可视化</div>
        </div>
      </div>

      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeView === item.key }"
          @click="activeView = item.key"
        >
          {{ item.label }}
        </button>
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
        <!-- 总体概览 -->
        <div v-if="activeView === 'overview'">
          <h2>总体概览</h2>
          <p>
            这里后面会放整体 KPI、总体岗位数量趋势等可视化图，比如不同公司的岗位数量、平均薪资、城市分布等。
          </p>
        </div>

        <!-- 公司对比（原来的薪资箱线图等） -->
        <div v-else-if="activeView === 'company'">
          <h2>公司对比</h2>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
            参考脉脉「大厂薪资地图」，对比不同公司的应届技术岗年薪与研发岗年薪区间分布，观察哪些公司更「豪」。
          </p>
          <CompanySalaryCompare />
        </div>

        <!-- 大厂收入对比（金币堆积动画） -->
        <div v-else-if="activeView === 'coinIncome'">
          <h2>大厂收入对比（金币堆积动画）</h2>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
            使用物理引擎模拟不同大厂的年度收入：收入越高，对应区域掉落并堆积的金币越多，最后形成三角形的小金山。
          </p>
          <!-- 给组件一个固定高度的容器，方便布局 -->
          <div style="height: 600px; margin-top: 8px; border-radius: 12px; overflow: hidden; background: #fff;">
            <CoinIncome />
          </div>
        </div>

        <!-- 城市分析 -->
        <div v-else-if="activeView === 'city'">
          <h2>城市分析</h2>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
            基于「第一梯队 / 第二梯队」图中列出的工作地点，统计 9 家大厂在各城市的覆盖情况，
            并按照一线 / 新一线城市做能级对比。
          </p>
          <CityDistribution />
        </div>
        
        <!-- 工作强度分析 -->
        <div v-else-if="activeView === 'workload'">
          <h2>工作强度分析</h2>
          <p>
            这里后面会放 JD 关键词、疑似 996 岗位占比、加班相关描述等分析图表，从文本角度审视用工文化。
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CompanySalaryCompare from './components/CompanySalaryCompare.vue'
import CityDistribution from './components/CityDistribution.vue'
import CoinIncome from './components/CoinIncome.vue'   // ✅ 新增引入

const activeView = ref('overview')

// ✅ 多加一个导航项：大厂收入对比
const navItems = [
  { key: 'overview',   label: '总体概览' },
  { key: 'company',    label: '公司对比' },
  { key: 'coinIncome', label: '大厂收入对比' },
  { key: 'city',       label: '城市分析' },
  { key: 'workload',   label: '工作强度分析' }
]

const currentTitle = computed(() => {
  const map = {
    overview:   '总体概览',
    company:    '公司对比视角',
    coinIncome: '大厂收入金币堆积图',
    city:       '城市与地域视角',
    workload:   '工作强度与用工文化'
  }
  return map[activeView.value] || '996-Explorer'
})

const currentSubtitle = computed(() => {
  const map = {
    overview:   '从整体维度观察中国互联网大厂的岗位与薪资生态。',
    company:    '比较不同公司的岗位结构、薪资区间与学历/经验要求。',
    coinIncome: '用动态金币堆积的方式，直观展示不同大厂的收入差异。',
    city:       '分析不同城市中的大厂岗位分布与打工“性价比”。',
    workload:   '结合 JD 关键词与岗位标签，探讨加班与强度问题。'
  }
  return map[activeView.value] || ''
})
</script>

<style scoped>
/* 整体布局：左侧窄栏 + 右侧主内容，白色简约背景 */
.layout {
  min-height: 100vh;
  display: flex;
  background: #f5f5f5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
}

/* 左侧导航栏 */
.sidebar {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 16px 16px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.brand-logo {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
}

.brand-text {
  margin-left: 10px;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
}

.brand-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.nav {
  margin: 8px 0;
  flex: 1;
  overflow-y: auto;
}

.nav-item {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.nav-item:hover {
  background: #f3f4f6;
}

.nav-item.active {
  background: #111827;
  color: #f9fafb;
}

.sidebar-footer {
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
  font-size: 11px;
  color: #6b7280;
}

.footer-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.footer-text {
  line-height: 1.5;
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
  padding: 16px 24px 12px;
}

.content-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.content-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}

.content-body {
  padding: 20px 24px 24px;
}

.content-body h2 {
  margin-top: 0;
  font-size: 18px;
  margin-bottom: 8px;
}

.content-body p {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
}
</style>
