<template>
  <div class="control-panel">
    <div class="control-group">
      <label for="company-select">选择公司：</label>
      <select 
        id="company-select" 
        v-model="localSelectedCompany" 
        class="company-select"
        @change="$emit('update:selectedCompany', localSelectedCompany)"
      >
        <option value="all">全部公司</option>
        <option v-for="company in companyList" :key="company" :value="company">
          {{ company }}
        </option>
      </select>
    </div>
    
    <div class="control-group">
      <label for="chart-view">视图模式：</label>
      <select 
        id="chart-view" 
        v-model="localChartViewMode" 
        class="view-mode-select"
        @change="$emit('update:chartViewMode', localChartViewMode)"
      >
        <option value="stacked">堆叠条形图</option>
        <option value="percentage">百分比视图</option>
        <option value="comparison">公司对比</option>
      </select>
    </div>
    
    <!-- <div class="control-group">
      <button 
        class="toggle-btn" 
        :class="{ 'active': localShowTrendLine }"
        @click="toggleTrendLine"
      >
        趋势线 {{ localShowTrendLine ? '✓' : '' }}
      </button>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'ControlPanel',
  
  props: {
    selectedCompany: {
      type: String,
      default: 'all'
    },
    companyList: {
      type: Array,
      default: () => []
    },
    chartViewMode: {
      type: String,
      default: 'stacked'
    },
    showTrendLine: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      localSelectedCompany: this.selectedCompany,
      localChartViewMode: this.chartViewMode,
      localShowTrendLine: this.showTrendLine
    };
  },
  
  watch: {
    selectedCompany(newVal) {
      this.localSelectedCompany = newVal;
    },
    chartViewMode(newVal) {
      this.localChartViewMode = newVal;
    },
    showTrendLine(newVal) {
      this.localShowTrendLine = newVal;
    }
  },
  
  methods: {
    toggleTrendLine() {
      this.localShowTrendLine = !this.localShowTrendLine;
      this.$emit('update:showTrendLine', this.localShowTrendLine);
    }
  }
};
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  white-space: nowrap;
}

.company-select,
.view-mode-select {
  padding: 8px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  background-color: white;
  color: #2d3748;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.company-select:hover,
.view-mode-select:hover {
  border-color: #90cdf4;
}

.company-select:focus,
.view-mode-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.toggle-btn {
  padding: 8px 16px;
  background-color: #edf2f7;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  color: #4a5568;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toggle-btn:hover {
  background-color: #e2e8f0;
}

.toggle-btn.active {
  background-color: #4299e1;
  color: white;
  border-color: #4299e1;
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .company-select,
  .view-mode-select {
    width: 100%;
  }
}
</style>