import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/Index.vue'
//动态生成
export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    component: () => import('@/views/login/login.vue'),
    name: "login"
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dataPlat',
    children: [
      {
        path: '/dataPlat',
        component: () => import('@/views/dataPlat/Index.vue'),
        name: 'dataPlat',
        meta: {
          title: '数据中台',
          icon: 'House'
        }
      }
    ]
  },
  {
    path: '/patientHistory',
    name: 'PatientHistory',
    component: () => import('@/views/call/PatientHistory.vue'),
    meta: {
        title: '患者病历'
    }
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes:constantRoutes
})

export default router