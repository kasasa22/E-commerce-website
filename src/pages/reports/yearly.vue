<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Yearly Report</h1>
      <div class="flex gap-2 sm:gap-3 w-full sm:w-auto">
        <input
          v-model="selectedYear"
          type="number"
          min="2020"
          :max="new Date().getFullYear()"
          class="flex-1 sm:flex-none sm:w-auto rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
          @change="fetchReport"
        />
        <button
          @click="printReport"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
        >
          Print
        </button>
      </div>
    </div>

    <div class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Summary</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg">
            <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Sales</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
              {{ yearlySales.length }}
            </dd>
          </div>
          <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg">
            <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Revenue</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
              {{ formatCurrency(totalRevenue) }}
            </dd>
          </div>
          <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg col-span-2 sm:col-span-1">
            <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Profit</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold" :class="yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(yearlyProfit) }}
            </dd>
          </div>
        </div>
      </div>
    </div>

    <div v-if="salesStore.loading" class="text-center py-8">
      <p class="text-gray-500">Loading report...</p>
    </div>

    <div v-else-if="yearlySales.length === 0" class="text-center py-8">
      <p class="text-gray-500">No sales found for this year.</p>
    </div>

    <div v-else>
      <div class="mb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search sales by product name or date..."
            class="block w-full sm:w-80 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2 pl-10"
          />
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div v-if="filteredSales.length === 0" class="text-center py-8">
        <p class="text-gray-500">No sales match your search.</p>
      </div>

      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md" id="report-table">
        <Table
          :columns="columns"
          :data="filteredSales"
        >
        <template #product_name="{ row }">
          {{ row.products?.name || '-' }}
        </template>
        <template #profit="{ row }">
          <span :class="row.profit >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatCurrency(row.profit) }}
          </span>
        </template>
      </Table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useSalesStore } from '../../stores/salesStore'
import Table from '../../components/Table.vue'
import { getDefaultCurrency } from '../../utils/supabase'

const salesStore = useSalesStore()
const currency = getDefaultCurrency()
const selectedYear = ref(new Date().getFullYear())
const searchQuery = ref('')

const yearlySales = computed(() => {
  if (!salesStore.sales || salesStore.sales.length === 0) return []
  if (!selectedYear.value) return salesStore.yearlySales || []
  
  return salesStore.sales.filter(sale => {
    if (!sale || !sale.sold_at) return false
    const saleDate = new Date(sale.sold_at)
    return saleDate.getFullYear() === parseInt(selectedYear.value)
  })
})

const filteredSales = computed(() => {
  if (!yearlySales.value || yearlySales.value.length === 0) return []
  if (!searchQuery.value.trim()) {
    return yearlySales.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return yearlySales.value.filter(sale => {
    if (!sale) return false
    const productName = sale.products?.name?.toLowerCase() || ''
    const saleDate = sale.sold_at ? new Date(sale.sold_at).toLocaleString().toLowerCase() : ''
    const quantity = sale.quantity ? sale.quantity.toString() : ''
    const price = sale.selling_price ? sale.selling_price.toString() : ''
    return productName.includes(query) ||
           saleDate.includes(query) ||
           quantity.includes(query) ||
           price.includes(query)
  })
})

const yearlyProfit = computed(() => {
  if (!yearlySales.value || yearlySales.value.length === 0) return 0
  return yearlySales.value.reduce((sum, sale) => {
    return sum + (sale.profit || 0)
  }, 0)
})

const totalRevenue = computed(() => {
  if (!yearlySales.value || yearlySales.value.length === 0) return 0
  return yearlySales.value.reduce((sum, sale) => {
    if (!sale || !sale.selling_price || !sale.quantity) return sum
    return sum + (sale.selling_price * sale.quantity)
  }, 0)
})

const columns = [
  { key: 'product_name', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'selling_price', label: 'Selling Price', type: 'currency' },
  { key: 'profit', label: 'Profit/Loss' },
  { key: 'sold_at', label: 'Date', type: 'datetime' },
]

onMounted(() => {
  salesStore.fetchSales()
})

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value)
}

function fetchReport() {
  salesStore.fetchSales()
}

function printReport() {
  window.print()
}
</script>

<style>
@media print {
  nav, button, input {
    display: none !important;
  }
  #report-table {
    break-inside: avoid;
  }
}
</style>

