<template>
  <div class="chart-container comparison-chart">
    <div class="chart-title-bar">校招比例与总岗位数关系散点图</div>
    
    <div class="scatter-plot">
      <div class="y-axis">
        <div v-for="(tick, index) in yAxisTicks" :key="index" class="y-tick">
          {{ tick }}%
        </div>
      </div>
      
      <div class="x-axis">
        <div v-for="(tick, index) in xAxisTicks" :key="index" class="x-tick">
          {{ tick }}
        </div>
      </div>
      
      <div class="plot-area">
        <div 
          v-for="item in data" 
          :key="item.company" 
          class="data-point"
          :style="{
            left: getScatterX(item.total) + '%',
            bottom: getScatterY(item.campusPercentage) + '%',
            backgroundColor: getFriendlinessColor(item.friendlinessScore)
          }"
          @click="$emit('companySelected', item.company)"
          :class="{ 'highlighted': selectedCompany === item.company }"
          :title="`${item.company}: 总岗位${item.total}, 校招比例${item.campusPercentage}%`"
        >
          <div class="point-tooltip">
            {{ item.company }}
          </div>
        </div>
      </div>
      
      <div class="axis-label y-label">校招比例 (%)</div>
      <div class="axis-label x-label">总岗位数</div>
    </div>
    
    <div class="scatter-legend">
      <div class="legend-title">友好度评分:</div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-dot" style="background-color: #48bb78;"></span>
          <span>优秀 (4-5分)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background-color: #4299e1;"></span>
          <span>良好 (3分)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background-color: #f6ad55;"></span>
          <span>一般 (2分)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background-color: #f56565;"></span>
          <span>待改进 (0-1分)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComparisonChart',
  
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
  },
  
  computed: {
    xAxisTicks() {
      if (this.data.length === 0) return [0, 100, 200, 300, 400, 500];
      
      const maxTotal = Math.max(...this.data.map(item => item.total));
      const roundedMax = Math.ceil(maxTotal / 100) * 100;
      
      const ticks = [];
      const step = roundedMax / 5;
      for (let i = 0; i <= 5; i++) {
        ticks.push(Math.round(i * step));
      }
      return ticks;
    },
    
    maxTotalJobs() {
      if (this.data.length === 0) return 100;
      return Math.max(...this.data.map(item => item.total));
    }
  },
  
  methods: {
    getScatterX(total) {
      return (total / this.maxTotalJobs) * 100;
    },
    
    getScatterY(percentage) {
      return percentage;
    },
    
    getFriendlinessColor(score) {
      if (score >= 4) return '#48bb78';
      if (score === 3) return '#4299e1';
      if (score === 2) return '#f6ad55';
      return '#f56565';
    }
  }
};
</script>

<style scoped>
.comparison-chart {
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

.scatter-plot {
  position: relative;
  width: 100%;
  height: 300px;
  background-color: #f7fafc;
  border-radius: 6px;
  padding: 20px 40px 40px 40px;
}

.y-axis {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
}

.y-tick {
  font-size: 0.8rem;
  color: #718096;
  text-align: right;
  padding-right: 5px;
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 40px;
  right: 0;
  height: 20px;
  display: flex;
  justify-content: space-between;
  padding-top: 5px;
}

.x-tick {
  font-size: 0.8rem;
  color: #718096;
  text-align: center;
  flex: 1;
}

.plot-area {
  position: absolute;
  top: 20px;
  left: 40px;
  right: 0;
  bottom: 20px;
}

.data-point {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translate(-50%, 50%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid white;
}

.data-point:hover {
  transform: translate(-50%, 50%) scale(1.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.data-point.highlighted {
  border-color: #2d3748;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
}

.point-tooltip {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(45, 55, 72, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.data-point:hover .point-tooltip {
  opacity: 1;
}

.axis-label {
  position: absolute;
  font-size: 0.9rem;
  color: #4a5568;
}

.y-label {
  left: 10px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: left center;
}

.x-label {
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.scatter-legend {
  margin-top: 20px;
  padding: 10px;
  background-color: #f7fafc;
  border-radius: 6px;
}

.legend-title {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #4a5568;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .scatter-plot {
    padding: 20px 30px 40px 30px;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 8px;
  }
}
</style>