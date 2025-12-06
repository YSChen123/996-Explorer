<template>
  <div class="stats-area">
    <div class="stat-card">
      <div class="stat-value">{{ stats.totalCampus }}</div>
      <div class="stat-label">校招岗位总数</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats.avgCampusPercentage }}%</div>
      <div class="stat-label">平均校招比例</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats.mostFriendlyCompany }}</div>
      <div class="stat-label">最友好公司</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ stats.highestCampusMonth }}</div>
      <div class="stat-label">校招高峰月份</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCards',
  
  props: {
    stats: {
      type: Object,
      required: true,
      default: () => ({
        totalCampus: 0,
        avgCampusPercentage: 0,
        mostFriendlyCompany: '无数据',
        highestCampusMonth: '无数据'
      })
    }
  }
};
</script>

<style scoped>
.stats-area {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4299e1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
}

@media (max-width: 768px) {
  .stats-area {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-area {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>