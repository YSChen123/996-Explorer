<template>
  <div class="salary-cost-page">
    <h2>中国互联网大厂薪资性价比</h2>
    <div class="tip">
      数据说明：基于网传研发岗薪资中位数与各城市租房/生活成本估算，仅供娱乐参考。
    </div>
    <SalaryCostMap />
  </div>
</template>

<script setup>
import SalaryCostMap from '../components/SalaryCostMap.vue'
</script>

<style scoped>
.salary-cost-page {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 8px;
  color: #1f2937;
}

.tip {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 20px;
}
</style>