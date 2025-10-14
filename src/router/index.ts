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
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        name: 'dashboard',
        meta: {
          title: '数据中台',
          icon: 'House'
        }
      }
    ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes:constantRoutes
})

export default router