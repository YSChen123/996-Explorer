<template>
  <div class="home-view">
    <header class="content-header">
      <h1>{{ currentTitle }}</h1>
      <p class="content-subtitle">{{ currentSubtitle }}</p>
    </header>

    <div class="sub-nav">
      <button 
        v-for="item in subNavItems" 
        :key="item.key"
        class="sub-nav-item"
        :class="{ active: activeView === item.key }"
        @click="activeView = item.key"
      >
        {{ item.label }}
      </button>
    </div>

    <section class="content-body">
      <div v-if="activeView === 'overview'">
        <h2>总体概览</h2>
        <p>这里展示整体 KPI、总体岗位数量趋势等可视化图。</p>
      </div>

      <div v-else-if="activeView === 'company'">
        <h2>公司对比</h2>
        <p class="desc">参考脉脉「大厂薪资地图」，对比不同公司的薪资区间分布。</p>
        <CompanySalaryCompare />
      </div>

      <div v-else-if="activeView === 'coinIncome'">
        <h2>大厂收入对比（金币堆积）</h2>
        <p class="desc">物理引擎模拟大厂年度收入，收入越高金币越多。</p>
        <div class="chart-box">
          <CoinIncome />
        </div>
      </div>

      <div v-else-if="activeView === 'city'">
        <h2>城市分析</h2>
        <p class="desc">统计 9 家大厂在各城市的覆盖情况。</p>
        <CityDistribution />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// 引入组件（注意路径，可能需要调整 ../components）
import CompanySalaryCompare from '../components/CompanySalaryCompare.vue'
import CityDistribution from '../components/CityDistribution.vue'
import CoinIncome from '../components/CoinIncome.vue'

const activeView = ref('overview')

// 定义首页内部的子导航
const subNavItems = [
  { key: 'overview',   label: '总体概览' },
  { key: 'company',    label: '公司对比' },
  { key: 'coinIncome', label: '收入对比' },
  { key: 'city',       label: '城市分析' }
]

const currentTitle = computed(() => {
  const map = {
    overview:   '总体概览',
    company:    '公司对比视角',
    coinIncome: '大厂收入金币堆积图',
    city:       '城市与地域视角'
  }
  return map[activeView.value]
})

const currentSubtitle = computed(() => {
  const map = {
    overview:   '从整体维度观察中国互联网大厂的岗位与薪资生态。',
    company:    '比较不同公司的岗位结构、薪资区间与学历/经验要求。',
    coinIncome: '用动态金币堆积的方式，直观展示不同大厂的收入差异。',
    city:       '分析不同城市中的大厂岗位分布与打工“性价比”。'
  }
  return map[activeView.value]
})
</script>

<style scoped>
.home-view { padding: 0; }
.content-header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 20px 24px; }
.content-header h1 { margin: 0; font-size: 22px; font-weight: 600; }
.content-subtitle { margin: 6px 0 0; font-size: 13px; color: #6b7280; }

.sub-nav { padding: 12px 24px; border-bottom: 1px solid #e5e7eb; background: #fff; display: flex; gap: 10px; }
.sub-nav-item { padding: 6px 16px; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; font-size: 13px; color: #374151; }
.sub-nav-item:hover { background: #f9fafb; }
.sub-nav-item.active { background: #111827; color: #fff; border-color: #111827; }

.content-body { padding: 24px; }
.desc { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
.chart-box { height: 600px; border-radius: 12px; overflow: hidden; background: #fff; border: 1px solid #e5e7eb; }
</style>