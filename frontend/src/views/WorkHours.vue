<template>
  <div class="chart-page">
    <header class="page-header">
      <h1>996 工作时长分布分析</h1>
      <p class="subtitle">数据来源: GitHub 996.ICU 仓库数据</p>
    </header>

    <div class="chart-container" ref="chartRef">
      </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// import * as echarts from 'echarts'; 

const chartRef = ref(null);

onMounted(() => {
  console.log("初始化图表...");
  // 这里写你的 ECharts 初始化代码
  // const myChart = echarts.init(chartRef.value);
  // myChart.setOption({...});
});
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.chart-container {
  width: 100%;
  height: 600px; /* 给图表一个固定高度 */
  background: #f9f9f9;
  border-radius: 8px;
  display: flex; 
  align-items: center; 
  justify-content: center;
}
</style>