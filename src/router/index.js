import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
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
    // {
    //   path: '/loginRegister',
    //   name: 'LoginRegister',
    //   component: () => import('../views/LoginRegister.vue')
    // },
    // {
    //   path: '/register',
    //   name: 'Register',
    //   component: () => import('../views/Register.vue')
    // },
    // {
    //   path: '/chat',
    //   name: 'Chat',
    //   component: () => import('../views/Chat.vue'),
    //   meta: { requiresAuth: true },
    //   children: [
    //     {
    //       path: 'private/:userId',
    //       name: 'PrivateChat',
    //       component: () => import('../views/chat/PrivateChat.vue')
    //     },
    //     {
    //       path: 'group/:groupId',
    //       name: 'GroupChat',
    //       component: () => import('../views/chat/GroupChat.vue')
    //     }
    //   ]
    // }
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