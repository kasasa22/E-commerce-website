import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/login/index.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('../layouts/DefaultLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../pages/dashboard/index.vue'),
          meta: { roles: ['superadmin', 'admin', 'seller'] },
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../pages/products/index.vue'),
          meta: { roles: ['superadmin', 'admin', 'seller'] },
        },
        {
          path: 'products/create',
          name: 'products-create',
          component: () => import('../pages/products/create.vue'),
          meta: { roles: ['superadmin', 'admin', 'seller'] },
        },
        {
          path: 'sales',
          name: 'sales',
          component: () => import('../pages/sales/index.vue'),
          meta: { roles: ['superadmin', 'admin', 'seller'] },
        },
        {
          path: 'sales/create',
          name: 'sales-create',
          component: () => import('../pages/sales/create.vue'),
          meta: { roles: ['superadmin', 'admin', 'seller'] },
        },
        {
          path: 'reports/daily',
          name: 'reports-daily',
          component: () => import('../pages/reports/daily.vue'),
          meta: { roles: ['superadmin', 'admin'] },
        },
        {
          path: 'reports/monthly',
          name: 'reports-monthly',
          component: () => import('../pages/reports/monthly.vue'),
          meta: { roles: ['superadmin', 'admin'] },
        },
        {
          path: 'reports/yearly',
          name: 'reports-yearly',
          component: () => import('../pages/reports/yearly.vue'),
          meta: { roles: ['superadmin', 'admin'] },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../pages/users/index.vue'),
          meta: { roles: ['superadmin', 'admin'] },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  try {
    const userStore = useUserStore()

    if (!userStore.isAuthenticated) {
      await userStore.checkAuth()
    }

    if (to.meta.requiresAuth === false) {
      if (userStore.isAuthenticated) {
        return next({ name: 'dashboard' })
      }
      return next()
    }

    if (!userStore.isAuthenticated) {
      return next({ name: 'login' })
    }

    if (to.meta.roles && !to.meta.roles.includes(userStore.userRole)) {
      return next({ name: 'dashboard' })
    }

    next()
  } catch (error) {
    console.error('Router guard error:', error)
    if (to.path !== '/login') {
      next({ name: 'login' })
    } else {
      next()
    }
  }
})

export default router

