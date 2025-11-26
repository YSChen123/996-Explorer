import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// ===== ECharts & vue-echarts 集成 =====
import { use } from 'echarts/core'
import { BarChart, PieChart, MapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

// 按需注册图表 & 组件
use([
  BarChart,
  PieChart,
  MapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
  CanvasRenderer
])

const app = createApp(App)
app.component('v-chart', VChart)
app.mount('#app')
