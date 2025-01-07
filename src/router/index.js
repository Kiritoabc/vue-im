import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'

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
          component: () => import('../views/ChatView.vue'),
          children: [
            {
              path: 'group/:id',  // 添加群聊动态路由
              name: 'groupChat',
              component: () => import('../views/ChatView.vue')
            },
            {
              path: 'personal/:id',  // 添加私聊动态路由
              name: 'PersonalChat',
              component: () => import('../views/ChatView.vue')
            }
          ]
        },
        {
          path: 'contact',
          name: 'contact',
          component: () => import('../views/ContactView.vue')
        },
        {
          path: 'ai',
          name: 'ai',
          component: () => import('../views/AIChatView.vue')
        },
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