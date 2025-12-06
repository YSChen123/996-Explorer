<template>
  <div class="chart-container percentage-chart">
    <div class="chart-title-bar">各大厂招聘类型百分比分布</div>
    
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color campus"></span>
        <span>校招比例</span>
      </div>
      <div class="legend-item">
        <span class="legend-color social"></span>
        <span>社招比例</span>
      </div>
      <div class="legend-item">
        <span class="legend-color intern"></span>
        <span>实习比例</span>
      </div>
    </div>
    
    <div class="chart-content">
      <div class="y-axis">
        <div v-for="(tick, index) in yAxisTicks" :key="index" class="y-tick">
          {{ tick }}%
        </div>
      </div>
      
      <div class="bars-container">
        <div 
          v-for="item in data" 
          :key="item.company" 
          class="bar-group"
          @click="$emit('companySelected', item.company)"
          :class="{ 'highlighted': selectedCompany === item.company }"
        >
          <div class="company-name">{{ item.company }}</div>
          <div class="percentage-bars">
            <div class="bar-container">
              <div 
                class="bar campus" 
                :style="{ height: item.campusPercentage + '%' }"
                :title="`校招: ${item.campusPercentage}%`"
              >
                <span class="bar-value">{{ item.campusPercentage }}%</span>
              </div>
            </div>
            <div class="bar-container">
              <div 
                class="bar social" 
                :style="{ height: item.socialPercentage + '%' }"
                :title="`社招: ${item.socialPercentage}%`"
              >
                <span class="bar-value">{{ item.socialPercentage }}%</span>
              </div>
            </div>
            <div class="bar-container">
              <div 
                class="bar intern" 
                :style="{ height: item.internPercentage + '%' }"
                :title="`实习: ${item.internPercentage}%`"
              >
                <span class="bar-value">{{ item.internPercentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PercentageChart',
  
  props: {
    data: {
      type: Array,
      required: true
    },
    selectedCompany: {
      type: String,
      default: 'all'
    }
  },
  
  data() {
    return {
      yAxisTicks: [0, 20, 40, 60, 80, 100]
    };
  }
};
</script>

<style scoped>
.percentage-chart {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-title-bar {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.chart-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f7fafc;
  border-radius: 6px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #4a5568;
}

.legend-color {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.campus {
  background-color: rgba(54, 162, 235, 0.8);
}

.legend-color.social {
  background-color: rgba(255, 99, 132, 0.8);
}

.legend-color.intern {
  background-color: rgba(75, 192, 192, 0.8);
}

.chart-content {
  display: flex;
  height: 300px;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40px;
  margin-right: 10px;
  padding-top: 20px;
  padding-bottom: 20px;
}

.y-tick {
  font-size: 0.8rem;
  color: #718096;
  text-align: right;
}

.bars-container {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  overflow-x: auto;
  padding-bottom: 10px;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100px;
  min-width: 100px;
  cursor: pointer;
  margin-right: 15px;
}

.bar-group.highlighted {
  background-color: rgba(66, 153, 225, 0.1);
  border-radius: 4px;
  padding: 5px;
}

.company-name {
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 10px;
  text-align: center;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-all;
}

.percentage-bars {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: calc(100% - 50px);
  gap: 4px;
}

.bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.bar {
  width: 100%;
  transition: height 0.5s ease;
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar.campus {
  background-color: rgba(54, 162, 235, 0.8);
}

.bar.social {
  background-color: rgba(255, 99, 132, 0.8);
}

.bar.intern {
  background-color: rgba(75, 192, 192, 0.8);
}

.bar-value {
  font-size: 0.7rem;
  color: white;
  font-weight: 600;
  position: absolute;
  top: 5px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .chart-content {
    height: 250px;
  }
  
  .bar-group {
    width: 80px;
    min-width: 80px;
  }
}
</style>