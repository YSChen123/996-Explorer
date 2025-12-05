import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import WorkHours from '../views/WorkHours.vue'
import SalaryMap from '../views/SalaryMap.vue'
import SalaryCost from '../views/SalaryCost.vue'
// 1. 引入新页面
import SkillTree from '../views/SkillTree.vue'

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
  },
  {
    path: '/salary-cost',
    name: 'SalaryCost',
    component: SalaryCost,
    meta: { title: '薪资性价比' }
  },
  // 2. 添加新路由配置
  {
    path: '/skill-tree',
    name: 'SkillTree',
    component: SkillTree,
    meta: { title: '岗位技能树' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router