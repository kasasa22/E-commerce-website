<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Daily Report</h1>
      <div class="flex space-x-3">
        <input
          v-model="selectedDate"
          type="date"
          class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          @change="fetchReport"
        />
        <button
          @click="printReport"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Print
        </button>
      </div>
    </div>

    <div class="bg-white shadow sm:rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Summary</h2>
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div class="bg-gray-50 px-4 py-5 rounded-lg">
            <dt class="text-sm font-medium text-gray-500">Total Sales</dt>
            <dd class="mt-1 text-2xl font-semibold text-gray-900">
              {{ dailySales.length }}
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 rounded-lg">
            <dt class="text-sm font-medium text-gray-500">Total Revenue</dt>
            <dd class="mt-1 text-2xl font-semibold text-gray-900">
              {{ formatCurrency(totalRevenue) }}
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 rounded-lg">
            <dt class="text-sm font-medium text-gray-500">Total Profit</dt>
            <dd class="mt-1 text-2xl font-semibold" :class="salesStore.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(salesStore.dailyProfit) }}
            </dd>
          </div>
        </div>
      </div>
    </div>

    <div v-if="salesStore.loading" class="text-center py-8">
      <p class="text-gray-500">Loading report...</p>
    </div>

    <div v-else-if="dailySales.length === 0" class="text-center py-8">
      <p class="text-gray-500">No sales found for this date.</p>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md" id="report-table">
      <Table
        :columns="columns"
        :data="dailySales"
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
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useSalesStore } from '../../stores/salesStore'
import Table from '../../components/Table.vue'
import { getDefaultCurrency } from '../../utils/supabase'

const salesStore = useSalesStore()
const currency = getDefaultCurrency()
const selectedDate = ref(new Date().toISOString().split('T')[0])

const dailySales = computed(() => {
  if (!selectedDate.value) return salesStore.dailySales
  return salesStore.sales.filter(sale => {
    const saleDate = new Date(sale.sold_at).toISOString().split('T')[0]
    return saleDate === selectedDate.value
  })
})

const totalRevenue = computed(() => {
  return dailySales.value.reduce((sum, sale) => sum + (sale.selling_price * sale.quantity), 0)
})

const columns = [
  { key: 'product_name', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'selling_price', label: 'Selling Price', type: 'currency' },
  { key: 'profit', label: 'Profit/Loss' },
  { key: 'sold_at', label: 'Time', type: 'datetime' },
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

