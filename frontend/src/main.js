import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// ===== ECharts & vue-echarts 集成 =====
import { use } from 'echarts/core'
import {
  BarChart,
  PieChart,
  MapChart,
  ScatterChart,       // 散点图
  EffectScatterChart, // 特效散点
  LinesChart,         // 路径图
  RadarChart,         // ✅ [新增] 雷达图 (用于技术栈对比)
  HeatmapChart        // ✅ [新增] 热力图 (用于技术分布)
} from 'echarts/charts'

import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
  VisualMapComponent
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

// 注册组件
use([
  BarChart,
  PieChart,
  MapChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
  RadarChart,   // ✅ 注册
  HeatmapChart, // ✅ 注册
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
  VisualMapComponent,
  CanvasRenderer
])

const app = createApp(App)
app.component('v-chart', VChart)
app.mount('#app')