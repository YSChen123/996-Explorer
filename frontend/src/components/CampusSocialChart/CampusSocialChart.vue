<template>
  <div class="campus-social-chart">
    <!-- 标题和说明区域 -->
    <HeaderSection />
    
    <!-- 控制面板区域 -->
    <ControlPanel 
      :selectedCompany="selectedCompany"
      :companyList="companyList"
      :chartViewMode="chartViewMode"
      :showTrendLine="showTrendLine"
      :selectedTimeRange="selectedTimeRange"
      :selectedTrendCompany="selectedTrendCompany"
      @update:selectedCompany="selectedCompany = $event"
      @update:chartViewMode="chartViewMode = $event"
      @update:showTrendLine="showTrendLine = $event"
      @update:selectedTimeRange="selectedTimeRange = $event"
      @update:selectedTrendCompany="selectedTrendCompany = $event"
    />
    
    <!-- 图表区域 -->
    <div class="charts-area">
      <!-- 堆叠条形图 -->
      <StackedBarChart 
        v-if="chartViewMode === 'stacked'"
        :data="filteredData"
        :selectedCompany="selectedCompany"
        @companySelected="selectCompany"
      />
      
      <!-- 百分比视图 -->
      <PercentageChart 
        v-if="chartViewMode === 'percentage'"
        :data="filteredData"
        :selectedCompany="selectedCompany"
        @companySelected="selectCompany"
      />
      
      <!-- 公司对比散点图 -->
      <ComparisonChart 
        v-if="chartViewMode === 'comparison'"
        :data="filteredData"
        :selectedCompany="selectedCompany"
        @companySelected="selectCompany"
      />
    </div>
    
    <!-- 时间趋势图
    <TrendChart 
      v-if="showTrendLine"
      :trendData="trendData"
      :selectedTrendCompany="selectedTrendCompany"
      :selectedTimeRange="selectedTimeRange"
      :companyList="companyList"
      @update:selectedTrendCompany="selectedTrendCompany = $event"
      @update:selectedTimeRange="selectedTimeRange = $event"
    /> -->
    
    <!-- 数据表格 -->
    <DataTable 
      :data="sortedData"
      :selectedCompany="selectedCompany"
      :sortColumn="sortColumn"
      :sortDirection="sortDirection"
      @companySelected="selectCompany"
      @sortData="sortData"
      @exportData="exportData"
    />
    
    <!-- 统计卡片 -->
    <StatsCards :stats="stats" />
  </div>
</template>

<script>
// 导入子组件
import HeaderSection from './HeaderSection.vue';
import ControlPanel from './ControlPanel.vue';
import StackedBarChart from './StackedBarChart.vue';
import PercentageChart from './PercentageChart.vue';
import ComparisonChart from './ComparisonChart.vue';
import TrendChart from './TrendChart.vue';
import DataTable from './DataTable.vue';
import StatsCards from './StatsCards.vue';

// 导入数据
import { companyData, trendData } from './data.js';

export default {
  name: 'CampusSocialChart',
  
  components: {
    HeaderSection,
    ControlPanel,
    StackedBarChart,
    PercentageChart,
    ComparisonChart,
    TrendChart,
    DataTable,
    StatsCards
  },
  
  data() {
    return {
      // 数据
      companyData,
      trendData,
      
      // 交互状态
      selectedCompany: 'all',
      chartViewMode: 'stacked',
      showTrendLine: true,
      selectedTimeRange: 'year',
      selectedTrendCompany: '阿里巴巴',
      sortColumn: 'campus',
      sortDirection: 'desc',
    };
  },
  
  computed: {
    // 公司列表
    companyList() {
      return this.companyData.map(item => item.company);
    },
    
    // 处理后的数据
    processedData() {
      return this.companyData.map(item => {
        const total = item.campus + item.social + item.intern;
        const campusPercentage = Math.round((item.campus / total) * 100);
        const socialPercentage = Math.round((item.social / total) * 100);
        const internPercentage = Math.round((item.intern / total) * 100);
        
        // 友好度评分
        let friendlinessScore = 0;
        if (campusPercentage == 31) friendlinessScore += 3;
        else if (campusPercentage >= 20) friendlinessScore += 2;
        else if (campusPercentage >= 10) friendlinessScore += 1;
        
        if (item.intern >= 50) friendlinessScore += 2;
        else if (item.intern >= 30) friendlinessScore += 1;
        
        return {
          ...item,
          total,
          campusPercentage,
          socialPercentage,
          internPercentage,
          friendlinessScore,
        };
      });
    },
    
    // 筛选后的数据
    filteredData() {
      return this.selectedCompany === 'all' 
        ? this.processedData 
        : this.processedData.filter(item => item.company === this.selectedCompany);
    },
    
    // 排序后的数据
    sortedData() {
      const data = this.filteredData;
      
      return data.sort((a, b) => {
        let aVal = a[this.sortColumn];
        let bVal = b[this.sortColumn];
        
        if (this.sortColumn === 'campusPercentage') {
          aVal = a.campusPercentage;
          bVal = b.campusPercentage;
        }
        
        if (this.sortDirection === 'asc') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      });
    },
    
    // 统计数据
    stats() {
      const filteredData = this.filteredData;
      
      if (filteredData.length === 0) {
        return {
          totalCampus: 0,
          avgCampusPercentage: 0,
          mostFriendlyCompany: '无数据',
          highestCampusMonth: '无数据',
        };
      }
      
      const totalCampus = filteredData.reduce((sum, item) => sum + item.campus, 0);
      const avgCampusPercentage = Math.round(
        filteredData.reduce((sum, item) => sum + item.campusPercentage, 0) / filteredData.length
      );
      
      // 找出最友好的公司
      // const mostFriendly = "腾讯";
      const mostFriendly = filteredData.reduce((max, item) => 
        item.friendlinessScore > max.friendlinessScore ? item : max, 
        filteredData[0]
      );
      
      // 计算校招高峰月份
      let monthlyCampusTotal = Array(12).fill(0);
      Object.values(this.trendData).forEach(companyTrend => {
        companyTrend.forEach((monthData, index) => {
          if (index < 12) {
            monthlyCampusTotal[index] += monthData.campus;
          }
        });
      });
      
      const maxMonthIndex = monthlyCampusTotal.indexOf(Math.max(...monthlyCampusTotal));
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      
      return {
        totalCampus,
        avgCampusPercentage,
        mostFriendlyCompany: mostFriendly.company,
        highestCampusMonth: months[maxMonthIndex] || '无数据',
      };
    },
  },
  
  methods: {
    // 选择公司
    selectCompany(company) {
      this.selectedCompany = company === this.selectedCompany ? 'all' : company;
    },
    
    // 排序数据
    sortData(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'desc';
      }
    },
    
    // 导出数据
    exportData() {
      const exportData = {
        summary: this.stats,
        companies: this.processedData,
        selectedCompany: this.selectedCompany,
        exportDate: new Date().toLocaleString(),
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = `campus-social-data-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      alert('数据已导出为JSON文件');
    },
  },
};
</script>

<style scoped>
.campus-social-chart {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.charts-area {
  margin: 20px 0;
}

@media (max-width: 768px) {
  .campus-social-chart {
    padding: 12px;
  }
}
</style>