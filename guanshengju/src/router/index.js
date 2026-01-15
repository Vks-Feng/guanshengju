import { createRouter, createWebHistory } from 'vue-router'

// 暂时先定义一个 Home 页面
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 切换路由时，页面滚动回顶部
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
