<template>
  <div class="min-h-screen bg-gray-50 flex">
    <div
      v-if="sidebarOpen || !isMobile"
      class="fixed inset-0 z-40 lg:static lg:inset-0"
      @click="isMobile && (sidebarOpen = false)"
    >
      <div
        class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
        :class="isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'"
        @click.stop
      >
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between h-16 px-6 border-b">
            <h1 class="text-xl font-semibold text-gray-900">
              {{ appName }}
            </h1>
            <button
              v-if="isMobile"
              @click="sidebarOpen = false"
              class="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <router-link
              to="/"
              @click="isMobile && (sidebarOpen = false)"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              :class="
                $route.path === '/'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </router-link>

            <router-link
              to="/products"
              @click="isMobile && (sidebarOpen = false)"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              :class="
                $route.path.startsWith('/products')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Products
            </router-link>

            <router-link
              to="/sales"
              @click="isMobile && (sidebarOpen = false)"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              :class="
                $route.path.startsWith('/sales')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Sales
            </router-link>

            <div v-if="userStore.isAdmin" class="pt-4">
              <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reports
              </p>
              <div class="mt-2 space-y-1">
                <router-link
                  :to="{ name: 'reports-daily' }"
                  @click="handleNavClick"
                  class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  :class="
                    $route.name === 'reports-daily'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Daily
                </router-link>
                <router-link
                  :to="{ name: 'reports-monthly' }"
                  @click="handleNavClick"
                  class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  :class="
                    $route.name === 'reports-monthly'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Monthly
                </router-link>
                <router-link
                  :to="{ name: 'reports-yearly' }"
                  @click="handleNavClick"
                  class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  :class="
                    $route.name === 'reports-yearly'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  "
                >
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Yearly
                </router-link>
              </div>
            </div>

            <router-link
              :to="{ name: 'expenses' }"
              @click="handleNavClick"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-4"
              :class="
                $route.name === 'expenses'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
              Expenses
            </router-link>

            <router-link
              :to="{ name: 'banking' }"
              @click="handleNavClick"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-1"
              :class="
                $route.name === 'banking'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Banking
            </router-link>

            <router-link
              v-if="userStore.isAdmin"
              :to="{ name: 'finance' }"
              @click="handleNavClick"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-1"
              :class="
                $route.name === 'finance'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Finance
            </router-link>

            <router-link
              v-if="userStore.isAdmin"
              :to="{ name: 'users' }"
              @click="handleNavClick"
              class="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mt-1"
              :class="
                $route.name === 'users'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              "
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
            </router-link>
          </nav>

          <div class="p-4 border-t">
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-900">
                {{ userStore.user?.name || userStore.user?.email }}
              </p>
              <p class="text-xs text-gray-500 capitalize">
                {{ userStore.userRole }}
              </p>
            </div>
            <button
              @click="handleSignOut"
              class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isMobile && sidebarOpen"
      class="fixed inset-0 z-30 bg-black bg-opacity-50"
      @click="sidebarOpen = false"
    ></div>

    <div class="flex-1 flex flex-col lg:ml-0">
      <header class="bg-white shadow-sm border-b lg:hidden">
        <div class="flex items-center justify-between h-16 px-4">
          <button
            @click="sidebarOpen = true"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-gray-900">
            {{ appName }}
          </h1>
          <div class="w-6"></div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 lg:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { getAppName } from '../utils/supabase'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appName = computed(() => getAppName())
const sidebarOpen = ref(false)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

function handleNavClick() {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

async function handleSignOut() {
  try {
    await userStore.signOut()
    // Always redirect to login page, even if signOut had an error
    // The signOut function will clear local state regardless
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Sign out error:', error)
    // Ensure we redirect even if there's an unexpected error
    router.push({ name: 'login' })
  }
}
</script>

