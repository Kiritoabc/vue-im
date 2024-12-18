import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      children: [
        {
          path: 'chat',
          name: 'chat',
          component: () => import('../views/ChatView.vue')
        },
        {
          path: 'contact',
          name: 'contact',
          component: () => import('../views/ContactView.vue')
        }
        // {
        //   path: 'favorites',
        //   name: 'favorites',
        //   component: () => import('../views/FavoritesView.vue')
        // },
        // {
        //   path: 'files',
        //   name: 'files',
        //   component: () => import('../views/FilesView.vue')
        // }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router