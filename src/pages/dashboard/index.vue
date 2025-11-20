<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading dashboard...</p>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-4 md:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-xs sm:text-sm font-bold">P</span>
                </div>
              </div>
              <div class="ml-2 sm:ml-3 md:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd class="text-base sm:text-lg font-medium text-gray-900">{{ productStore.products.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-4 md:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-xs sm:text-sm font-bold">S</span>
                </div>
              </div>
              <div class="ml-2 sm:ml-3 md:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                  <dd class="text-base sm:text-lg font-medium text-gray-900">{{ dailySalesCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-4 md:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-xs sm:text-sm font-bold">$</span>
                </div>
              </div>
              <div class="ml-2 sm:ml-3 md:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Today's Revenue</dt>
                  <dd class="text-base sm:text-lg font-medium text-gray-900">
                    {{ formatCurrency(dailySalesAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-4 md:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-xs sm:text-sm font-bold">!</span>
                </div>
              </div>
              <div class="ml-2 sm:ml-3 md:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd class="text-base sm:text-lg font-medium text-gray-900">{{ lowStockCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Today's Sales</h3>
            <div v-if="dailySales.length === 0" class="text-sm text-gray-500">
              No sales today
            </div>
            <div v-else class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="sale in dailySales"
                :key="sale.id"
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ sale.products?.name || 'Unknown Product' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(sale.sold_at).toLocaleTimeString() }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatCurrency(sale.selling_price * sale.quantity) }}
                  </p>
                  <p class="text-xs" :class="sale.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(sale.profit) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Low Stock Alerts</h3>
            <div v-if="lowStockProducts.length === 0" class="text-sm text-gray-500">
              All products are well stocked
            </div>
            <div v-else class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="product in lowStockProducts"
                :key="product.id"
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-red-600">{{ product.quantity }} left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="userStore.isAdmin" class="bg-white shadow rounded-lg">
        <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Quick Stats</h3>
          <div class="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg">
              <dt class="text-xs sm:text-sm font-medium text-gray-500">Today's Profit</dt>
              <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold" :class="salesStore.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salesStore.dailyProfit) }}
              </dd>
            </div>
            <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg">
              <dt class="text-xs sm:text-sm font-medium text-gray-500">This Month's Profit</dt>
              <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold" :class="salesStore.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salesStore.monthlyProfit) }}
              </dd>
            </div>
            <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg sm:col-span-2 lg:col-span-1">
              <dt class="text-xs sm:text-sm font-medium text-gray-500">This Year's Profit</dt>
              <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold" :class="salesStore.yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salesStore.yearlyProfit) }}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useProductStore } from '../../stores/productStore'
import { useSalesStore } from '../../stores/salesStore'
import { useUserStore } from '../../stores/userStore'
import { getDefaultCurrency } from '../../utils/supabase'

const productStore = useProductStore()
const salesStore = useSalesStore()
const userStore = useUserStore()
const currency = getDefaultCurrency()

const loading = computed(() => productStore.loading || salesStore.loading)

const lowStockProducts = computed(() => {
  return productStore.getLowStockProducts(10)
})

const lowStockCount = computed(() => {
  return productStore.getLowStockProducts(10).length
})

const dailySales = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return salesStore.sales.filter(sale => {
    const saleDate = new Date(sale.sold_at).toISOString().split('T')[0]
    return saleDate === today
  }).sort((a, b) => new Date(b.sold_at) - new Date(a.sold_at))
})

const dailySalesCount = computed(() => {
  return dailySales.value.length
})

const dailySalesAmount = computed(() => {
  return dailySales.value.reduce((sum, sale) => {
    if (!sale || !sale.selling_price || !sale.quantity) return sum
    return sum + (sale.selling_price * sale.quantity)
  }, 0)
})

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value)
}

onMounted(() => {
  productStore.fetchProducts()
  salesStore.fetchSales()
})
</script>

