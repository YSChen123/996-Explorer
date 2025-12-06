<template>
  <div class="chart-container stacked-bar-chart">
    <div class="chart-title-bar">各大厂招聘类型分布（堆叠视图）</div>
    
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color campus"></span>
        <span>校招岗位</span>
      </div>
      <div class="legend-item">
        <span class="legend-color social"></span>
        <span>社招岗位</span>
      </div>
      <div class="legend-item">
        <span class="legend-color intern"></span>
        <span>实习岗位</span>
      </div>
    </div>
    
    <div class="chart-content">
      <div class="y-axis">
        <div v-for="(tick, index) in yAxisTicks" :key="index" class="y-tick">
          {{ tick }}
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
          <div class="stacked-bar">
            <div 
              class="bar-segment campus" 
              :style="{ height: getHeight(item.campus) + '%' }"
              :title="`校招: ${item.campus}`"
            >
              <span class="segment-value" v-if="item.campus > 0">{{ item.campus }}</span>
            </div>
            <div 
              class="bar-segment social" 
              :style="{ height: getHeight(item.social) + '%' }"
              :title="`社招: ${item.social}`"
            >
              <span class="segment-value" v-if="item.social > 0">{{ item.social }}</span>
            </div>
            <div 
              class="bar-segment intern" 
              :style="{ height: getHeight(item.intern) + '%' }"
              :title="`实习: ${item.intern}`"
            >
              <span class="segment-value" v-if="item.intern > 0">{{ item.intern }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StackedBarChart',
  
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
      yAxisTicks: [0, 100, 200, 300, 400, 500, 600]
    };
  },
  
  computed: {
    maxTotal() {
      if (this.data.length === 0) return 100;
      return Math.max(...this.data.map(item => item.total));
    }
  },
  
  methods: {
    getHeight(value) {
      return (value / this.maxTotal) * 100;
    }
  }
};
</script>

<style scoped>
.stacked-bar-chart {
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
  width: 60px;
  min-width: 60px;
  cursor: pointer;
  transition: transform 0.2s;
  margin-right: 15px;
}

.bar-group:hover {
  transform: translateY(-5px);
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

.stacked-bar {
  height: calc(100% - 50px);
  width: 40px;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar-segment {
  transition: height 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-segment.campus {
  background-color: rgba(54, 162, 235, 0.8);
}

.bar-segment.social {
  background-color: rgba(255, 99, 132, 0.8);
}

.bar-segment.intern {
  background-color: rgba(75, 192, 192, 0.8);
}

.segment-value {
  font-size: 0.7rem;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .chart-content {
    height: 250px;
  }
  
  .bar-group {
    width: 50px;
    min-width: 50px;
  }
  
  .stacked-bar {
    width: 35px;
  }
}
</style>