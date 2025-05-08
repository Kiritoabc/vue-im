import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import { ElMessage } from 'element-plus'

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
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'chat',
          name: 'chat',
          component: () => import('../views/ChatView.vue'),
          meta: { requiresAuth: true },
          children: [
            {
              path: 'group/:id',
              name: 'groupChat',
              component: () => import('../views/ChatView.vue'),
              meta: { requiresAuth: true }
            },
            {
              path: 'personal/:id',
              name: 'PersonalChat',
              component: () => import('../views/ChatView.vue'),
              meta: { requiresAuth: true }
            }
          ]
        },
        {
          path: 'contact',
          name: 'contact',
          component: () => import('../views/ContactView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'ai',
          name: 'ai',
          component: () => import('../views/AIChatView.vue'),
          meta: { requiresAuth: true }
        },
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    // 需要认证但没有token，显示提示并重定向到登录页
    ElMessage({
      message: '请先登录',
      type: 'warning',
      duration: 2000
    })
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录用户访问登录页，重定向到首页
    next('/chat')
  } else {
    // 其他情况正常放行
    next()
  }
})

export default router