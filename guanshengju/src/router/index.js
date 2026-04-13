import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'GUANSHENGJU'
    }
  },
  {
    path: '/blog',
    name: 'BlogIndex',
    component: () => import('../views/BlogIndex.vue'),
    meta: {
      title: 'Blog | GUANSHENGJU'
    }
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: () => import('../views/BlogPost.vue'),
    meta: {
      title: 'Blog | GUANSHENGJU'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            el: to.hash,
            top: 96,
            behavior: 'smooth'
          })
        }, 250)
      })
    }

    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = typeof to.meta.title === 'string' ? to.meta.title : 'GUANSHENGJU'
})

export default router
