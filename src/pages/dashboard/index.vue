<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading dashboard...</p>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-bold">P</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ productStore.products.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-bold">S</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ salesStore.sales.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-bold">$</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Profit</dt>
                  <dd class="text-lg font-medium" :class="salesStore.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(salesStore.totalProfit) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-bold">!</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ lowStockCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Sales</h3>
            <div v-if="salesStore.sales.length === 0" class="text-sm text-gray-500">
              No sales yet
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="sale in recentSales"
                :key="sale.id"
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ sale.products?.name || 'Unknown Product' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(sale.sold_at).toLocaleString() }}
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
            <div v-else class="space-y-3">
              <div
                v-for="product in lowStockProducts"
                :key="product.id"
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-xs text-gray-500">{{ product.brand }} - {{ product.type }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-red-600">{{ product.quantity }} left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div class="bg-gray-50 px-4 py-5 rounded-lg">
              <dt class="text-sm font-medium text-gray-500">Today's Profit</dt>
              <dd class="mt-1 text-2xl font-semibold" :class="salesStore.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salesStore.dailyProfit) }}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-5 rounded-lg">
              <dt class="text-sm font-medium text-gray-500">This Month's Profit</dt>
              <dd class="mt-1 text-2xl font-semibold" :class="salesStore.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salesStore.monthlyProfit) }}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-5 rounded-lg">
              <dt class="text-sm font-medium text-gray-500">This Year's Profit</dt>
              <dd class="mt-1 text-2xl font-semibold" :class="salesStore.yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
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
import { getDefaultCurrency } from '../../utils/supabase'

const productStore = useProductStore()
const salesStore = useSalesStore()
const currency = getDefaultCurrency()

const loading = computed(() => productStore.loading || salesStore.loading)

const lowStockProducts = computed(() => {
  return productStore.getLowStockProducts(10).slice(0, 5)
})

const lowStockCount = computed(() => {
  return productStore.getLowStockProducts(10).length
})

const recentSales = computed(() => {
  return salesStore.sales.slice(0, 5)
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

