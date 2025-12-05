import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// ===== ECharts & vue-echarts 集成 =====
import { use } from 'echarts/core'
import {
  BarChart,
  PieChart,
  MapChart,
  ScatterChart,       // ✅ 新增
  EffectScatterChart, // ✅ 新增
  LinesChart          // ✅ 新增
} from 'echarts/charts'

import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
  VisualMapComponent // ✅ 新增
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
  BarChart,
  PieChart,
  MapChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
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