<template>
  <div class="salary-dist-page">
    <h2>大厂薪资分布地图</h2>
    <p class="desc">
      直观展示各大互联网公司在全国各地的薪资水平分布（不含生活成本抵扣）。
    </p>
    <SalaryDistributionMap />
  </div>
</template>

<script setup>
import SalaryDistributionMap from '../components/SalaryDistributionMap.vue'
</script>

<style scoped>
.salary-dist-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
h2 { margin: 0 0 8px 0; color: #1f2937; }
.desc { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
</style>