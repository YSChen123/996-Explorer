<template>
  <div class="trend-controls">
    <div class="control-group">
      <label for="trend-company">选择公司：</label>
      <select 
        id="trend-company" 
        v-model="localSelectedTrendCompany" 
        class="company-select"
        @change="$emit('update:selectedTrendCompany', localSelectedTrendCompany)"
      >
        <option v-for="company in companyList" :key="company" :value="company">
          {{ company }}
        </option>
      </select>
    </div>
    <div class="control-group">
      <label for="time-range">时间范围：</label>
      <select 
        id="time-range" 
        v-model="localSelectedTimeRange" 
        class="time-range-select"
        @change="$emit('update:selectedTimeRange', localSelectedTimeRange)"
      >
        <option value="year">全年趋势</option>
        <option value="seasonal">季度趋势</option>
        <option value="monthly">月度趋势</option>
      </select>
    </div>
  </div>

  <div class="trend-content">
    <div class="trend-legend">
      <div class="legend-item">
        <span class="legend-line campus"></span>
        <span>校招岗位</span>
      </div>
      <div class="legend-item">
        <span class="legend-line social"></span>
        <span>社招岗位</span>
      </div>
      <div class="legend-item">
        <span class="legend-line intern"></span>
        <span>实习岗位</span>
      </div>
    </div>
    
    <div class="trend-graph">
      <div class="graph-y-axis">
        <div v-for="(tick, index) in trendYTicks" :key="index" class="y-tick">
          {{ tick }}
        </div>
      </div>
      
      <div class="graph-area">
        <!-- 网格线 -->
        <div class="grid-lines">
          <div 
            v-for="(tick, index) in trendYTicks" 
            :key="'grid-' + index" 
            class="grid-line"
            :style="{ top: getGridLinePosition(tick) + '%' }"
          ></div>
        </div>
        
        <!-- 折线容器（裁剪区域） -->
        <div class="lines-container">
          <!-- 校招折线 -->
          <div class="trend-line campus" v-if="showCampus">
            <div 
              v-for="(segment, index) in campusSegments" 
              :key="'campus-' + index"
              class="line-segment"
              :style="{
                left: segment.start.x + '%',
                top: segment.start.y + '%',
                width: segment.width + '%',
                height: '2px',
                transform: 'rotate(' + segment.angle + 'rad)',
                transformOrigin: '0 0'
              }"
            ></div>
            <div 
              v-for="(point, index) in trendPoints" 
              :key="'campus-point-' + index"
              class="data-point campus"
              :style="{
                left: getPointX(index) + '%',
                top: getPointY('campus', index) + '%'
              }"
              :title="`${point.month}: ${point.campus}个岗位`"
            ></div>
          </div>
          
          <!-- 社招折线 -->
          <div class="trend-line social" v-if="showSocial">
            <div 
              v-for="(segment, index) in socialSegments" 
              :key="'social-' + index"
              class="line-segment"
              :style="{
                left: segment.start.x + '%',
                top: segment.start.y + '%',
                width: segment.width + '%',
                height: '2px',
                transform: 'rotate(' + segment.angle + 'rad)',
                transformOrigin: '0 0'
              }"
            ></div>
            <div 
              v-for="(point, index) in trendPoints" 
              :key="'social-point-' + index"
              class="data-point social"
              :style="{
                left: getPointX(index) + '%',
                top: getPointY('social', index) + '%'
              }"
              :title="`${point.month}: ${point.social}个岗位`"
            ></div>
          </div>
          
          <!-- 实习折线 -->
          <div class="trend-line intern" v-if="showIntern">
            <div 
              v-for="(segment, index) in internSegments" 
              :key="'intern-' + index"
              class="line-segment"
              :style="{
                left: segment.start.x + '%',
                top: segment.start.y + '%',
                width: segment.width + '%',
                height: '2px',
                transform: 'rotate(' + segment.angle + 'rad)',
                transformOrigin: '0 0'
              }"
            ></div>
            <div 
              v-for="(point, index) in trendPoints" 
              :key="'intern-point-' + index"
              class="data-point intern"
              :style="{
                left: getPointX(index) + '%',
                top: getPointY('intern', index) + '%'
              }"
              :title="`${point.month}: ${point.intern}个岗位`"
            ></div>
          </div>
        </div>
        
        <!-- X轴标签 -->
        <div class="x-axis">
          <div 
            v-for="(point, index) in trendPoints" 
            :key="'x-label-' + index"
            class="x-label"
            :style="{ left: getPointX(index) + '%' }"
          >
            {{ point.month }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 数据显示控制 -->
  <div class="data-toggle">
    <div class="toggle-item" @click="toggleData('campus')">
      <span class="toggle-indicator" :class="{ active: showCampus }"></span>
      <span>校招岗位</span>
    </div>
    <div class="toggle-item" @click="toggleData('social')">
      <span class="toggle-indicator" :class="{ active: showSocial }"></span>
      <span>社招岗位</span>
    </div>
    <div class="toggle-item" @click="toggleData('intern')">
      <span class="toggle-indicator" :class="{ active: showIntern }"></span>
      <span>实习岗位</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrendChart',
  
  props: {
    trendData: {
      type: Object,
      required: true
    },
    selectedTrendCompany: {
      type: String,
      default: '阿里巴巴'
    },
    selectedTimeRange: {
      type: String,
      default: 'year'
    },
    companyList: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      localSelectedTrendCompany: this.selectedTrendCompany,
      localSelectedTimeRange: this.selectedTimeRange,
      showCampus: true,
      showSocial: true,
      showIntern: true
    };
  },
  
  watch: {
    selectedTrendCompany(newVal) {
      this.localSelectedTrendCompany = newVal;
    },
    selectedTimeRange(newVal) {
      this.localSelectedTimeRange = newVal;
    }
  },
  
  computed: {
    // 处理趋势数据点
    trendPoints() {
      const companyTrend = this.trendData[this.localSelectedTrendCompany] || [];
      let dataToUse = [];
      
      if (this.localSelectedTimeRange === 'year') {
        dataToUse = companyTrend;
      } else if (this.localSelectedTimeRange === 'seasonal') {
        // 简化为季度数据
        dataToUse = [
          {
            month: 'Q1',
            campus: companyTrend.slice(0, 3).reduce((sum, item) => sum + item.campus, 0),
            social: companyTrend.slice(0, 3).reduce((sum, item) => sum + item.social, 0),
            intern: companyTrend.slice(0, 3).reduce((sum, item) => sum + item.intern, 0),
          },
          {
            month: 'Q2',
            campus: companyTrend.slice(3, 6).reduce((sum, item) => sum + item.campus, 0),
            social: companyTrend.slice(3, 6).reduce((sum, item) => sum + item.social, 0),
            intern: companyTrend.slice(3, 6).reduce((sum, item) => sum + item.intern, 0),
          },
          {
            month: 'Q3',
            campus: companyTrend.slice(6, 9).reduce((sum, item) => sum + item.campus, 0),
            social: companyTrend.slice(6, 9).reduce((sum, item) => sum + item.social, 0),
            intern: companyTrend.slice(6, 9).reduce((sum, item) => sum + item.intern, 0),
          },
          {
            month: 'Q4',
            campus: companyTrend.slice(9, 12).reduce((sum, item) => sum + item.campus, 0),
            social: companyTrend.slice(9, 12).reduce((sum, item) => sum + item.social, 0),
            intern: companyTrend.slice(9, 12).reduce((sum, item) => sum + item.intern, 0),
          },
        ];
      } else if (this.localSelectedTimeRange === 'monthly') {
        dataToUse = companyTrend.slice(0, 6);
      }
      
      return dataToUse;
    },
    
    // 计算最大值用于Y轴刻度
    trendMaxValue() {
      const points = this.trendPoints;
      if (points.length === 0) return 100;
      
      const maxCampus = Math.max(...points.map(p => p.campus));
      const maxSocial = Math.max(...points.map(p => p.social));
      const maxIntern = Math.max(...points.map(p => p.intern));
      const maxValue = Math.max(maxCampus, maxSocial, maxIntern);
      
      // 向上取整到最近的10的倍数
      return Math.ceil(maxValue / 10) * 10;
    },
    
    // Y轴刻度
    trendYTicks() {
      const max = this.trendMaxValue;
      const ticks = [];
      const step = max / 5;
      
      for (let i = 0; i <= 5; i++) {
        ticks.push(Math.round(i * step));
      }
      
      return ticks;
    },
    
    // 计算校招岗位的折线段
    campusSegments() {
      return this.calculateSegments('campus');
    },
    
    // 计算社招岗位的折线段
    socialSegments() {
      return this.calculateSegments('social');
    },
    
    // 计算实习岗位的折线段
    internSegments() {
      return this.calculateSegments('intern');
    }
  },
  
  methods: {
    // 计算网格线位置
    getGridLinePosition(tick) {
      return 100 - (tick / this.trendMaxValue) * 100;
    },
    
    // 计算X轴位置
    getPointX(index) {
      const totalPoints = this.trendPoints.length;
      if (totalPoints <= 1) return 0;
      return (index / (totalPoints - 1)) * 100;
    },
    
    // 计算Y轴位置
    getPointY(type, index) {
      const value = this.trendPoints[index][type];
      return 100 - (value / this.trendMaxValue) * 100;
    },
    
    // 计算折线段
    calculateSegments(type) {
      const points = this.trendPoints;
      const segments = [];
      
      if (points.length < 2) return segments;
      
      for (let i = 0; i < points.length - 1; i++) {
        const startX = this.getPointX(i);
        const startY = this.getPointY(type, i);
        const endX = this.getPointX(i + 1);
        const endY = this.getPointY(type, i + 1);
        
        // 计算两点之间的距离（作为线段宽度）
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const width = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 计算旋转角度
        const angle = Math.atan2(deltaY, deltaX);
        
        segments.push({
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
          width,
          angle
        });
      }
      
      return segments;
    },
    
    // 切换数据显示
    toggleData(type) {
      if (type === 'campus') {
        this.showCampus = !this.showCampus;
      } else if (type === 'social') {
        this.showSocial = !this.showSocial;
      } else if (type === 'intern') {
        this.showIntern = !this.showIntern;
      }
    }
  }
};
</script>

<style scoped>
.trend-chart {
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

.trend-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
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
.time-range-select {
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
.time-range-select:hover {
  border-color: #90cdf4;
}

.company-select:focus,
.time-range-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.trend-content {
  height: 350px;
}

.trend-legend {
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
  cursor: pointer;
  transition: opacity 0.2s;
}

.legend-item:hover {
  opacity: 0.8;
}

.legend-line {
  display: inline-block;
  width: 20px;
  height: 3px;
  border-radius: 1.5px;
}

.legend-line.campus {
  background-color: rgba(54, 162, 235, 1);
}

.legend-line.social {
  background-color: rgba(255, 99, 132, 1);
}

.legend-line.intern {
  background-color: rgba(75, 192, 192, 1);
}

.trend-graph {
  display: flex;
  height: 250px;
}

.graph-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40px;
  margin-right: 10px;
  padding: 10px 0;
}

.graph-y-axis .y-tick {
  font-size: 0.8rem;
  color: #718096;
  text-align: right;
  height: 20px;
  line-height: 20px;
}

.graph-area {
  flex: 1;
  position: relative;
  border-left: 1px solid #cbd5e0;
  border-bottom: 1px solid #cbd5e0;
  padding: 0 0 30px 0;
  background-color: #fcfdfe;
  border-radius: 0 0 4px 0;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 30px;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid #e2e8f0;
}

.lines-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 30px;
}

.trend-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.line-segment {
  position: absolute;
  background-color: currentColor;
  transform-origin: 0 0;
}

.trend-line.campus .line-segment {
  color: rgba(54, 162, 235, 1);
}

.trend-line.social .line-segment {
  color: rgba(255, 99, 132, 1);
}

.trend-line.intern .line-segment {
  color: rgba(75, 192, 192, 1);
}

.data-point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.data-point.campus {
  background-color: rgba(54, 162, 235, 1);
}

.data-point.social {
  background-color: rgba(255, 99, 132, 1);
}

.data-point.intern {
  background-color: rgba(75, 192, 192, 1);
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
}

.x-label {
  position: absolute;
  font-size: 0.8rem;
  color: #718096;
  transform: translateX(-50%);
  white-space: nowrap;
  text-align: center;
  width: 60px;
  margin-left: -30px;
}

.data-toggle {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding: 10px;
  background-color: #f7fafc;
  border-radius: 6px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.toggle-item:hover {
  background-color: #e2e8f0;
}

.toggle-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 2px solid #cbd5e0;
  transition: all 0.2s;
}

.toggle-indicator.active {
  background-color: #4299e1;
  border-color: #4299e1;
}

.toggle-item:nth-child(1) .toggle-indicator.active {
  background-color: rgba(54, 162, 235, 1);
  border-color: rgba(54, 162, 235, 1);
}

.toggle-item:nth-child(2) .toggle-indicator.active {
  background-color: rgba(255, 99, 132, 1);
  border-color: rgba(255, 99, 132, 1);
}

.toggle-item:nth-child(3) .toggle-indicator.active {
  background-color: rgba(75, 192, 192, 1);
  border-color: rgba(75, 192, 192, 1);
}

@media (max-width: 768px) {
  .trend-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .company-select,
  .time-range-select {
    width: 100%;
  }
  
  .trend-content {
    height: 300px;
  }
  
  .data-toggle {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}
</style>