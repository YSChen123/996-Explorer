import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import WorkHours from '../views/WorkHours.vue'
// ❌ 删除 SalaryMap 引用
import SalaryCost from '../views/SalaryCost.vue'
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
  // ❌ 删除 /salary-map 路由
  {
    path: '/salary-cost',
    name: 'SalaryCost',
    component: SalaryCost,
    meta: { title: '薪资性价比' }
  },
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