import { createRouter, createWebHistory } from 'vue-router'

// 引入你的可视化页面组件
import HomeView from '../views/HomeView.vue'
import WorkHours from '../views/WorkHours.vue'
import SalaryMap from '../views/SalaryMap.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: '项目介绍' }
  },
  {
    path: '/work-hours',
    name: 'WorkHours',
    component: WorkHours,
    meta: { title: '996 工时分布' }
  },
  {
    path: '/salary-map',
    name: 'SalaryMap',
    component: SalaryMap,
    meta: { title: '薪资地域热力图' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router