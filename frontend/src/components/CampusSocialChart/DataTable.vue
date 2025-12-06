<template>
  <div class="chart-container data-table-area">
    <div class="table-header">
      <h4>详细数据</h4>
      <button class="export-btn" @click="$emit('exportData')">
        <span class="export-icon">📊</span> 导出数据
      </button>
    </div>
    
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="$emit('sortData', 'company')" class="sortable">
              公司名称
              <span v-if="sortColumn === 'company'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="$emit('sortData', 'campus')" class="sortable">
              校招岗位
              <span v-if="sortColumn === 'campus'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="$emit('sortData', 'social')" class="sortable">
              社招岗位
              <span v-if="sortColumn === 'social'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="$emit('sortData', 'intern')" class="sortable">
              实习岗位
              <span v-if="sortColumn === 'intern'" class="sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>校招比例</th>
            <th>友好度评分</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in data" 
            :key="item.company"
            :class="{ 'highlighted': selectedCompany === item.company }"
            @click="$emit('companySelected', item.company)"
          >
            <td class="company-cell">
              <div class="company-info">
                <span class="company-logo">{{ item.logo }}</span>
                {{ item.company }}
              </div>
            </td>
            <td>{{ item.campus }}</td>
            <td>{{ item.social }}</td>
            <td>{{ item.intern }}</td>
            <td>
              <div class="percentage-bar-container">
                <div 
                  class="percentage-bar" 
                  :style="{ width: item.campusPercentage + '%' }"
                ></div>
                <span class="percentage-text">{{ item.campusPercentage }}%</span>
              </div>
            </td>
            <td>
              <div class="rating">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  class="star"
                  :class="{ 'filled': star <= item.friendlinessScore }"
                >
                  ★
                </span>
                <span class="rating-text">{{ item.friendlinessScore }}/5</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  
  props: {
    data: {
      type: Array,
      required: true
    },
    selectedCompany: {
      type: String,
      default: 'all'
    },
    sortColumn: {
      type: String,
      default: 'campus'
    },
    sortDirection: {
      type: String,
      default: 'desc'
    }
  }
};
</script>

<style scoped>
.data-table-area {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: #38a169;
}

.export-icon {
  font-size: 1rem;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f7fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.sortable:hover {
  background-color: #edf2f7;
}

.sort-indicator {
  margin-left: 4px;
  font-size: 0.9rem;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background-color: #f7fafc;
}

.data-table tbody tr.highlighted {
  background-color: #ebf8ff;
}

.company-cell {
  font-weight: 600;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.company-logo {
  font-size: 1.2rem;
}

.percentage-bar-container {
  position: relative;
  height: 24px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  min-width: 100px;
}

.percentage-bar {
  height: 100%;
  background-color: #4299e1;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.percentage-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.85rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star {
  color: #cbd5e0;
  font-size: 1.2rem;
}

.star.filled {
  color: #f6ad55;
}

.rating-text {
  margin-left: 8px;
  font-size: 0.9rem;
  color: #718096;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .export-btn {
    align-self: flex-start;
  }
  
  .data-table {
    font-size: 0.85rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 12px;
  }
}
</style>