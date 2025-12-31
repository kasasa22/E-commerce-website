<template>
  <div>
    <div
      v-if="toast.show"
      class="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300"
      :class="toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ toast.message }}
    </div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Daily Report</h1>
      <div class="flex gap-2 sm:gap-3 w-full sm:w-auto">
        <input
          v-model="selectedDate"
          type="date"
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
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          <div class="bg-blue-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg border border-blue-200">
            <dt class="text-xs sm:text-sm font-medium text-blue-600">Balance B/D</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-blue-700">
              {{ formatCurrency(balanceBD) }}
            </dd>
          </div>
          <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg">
            <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Sales</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
              {{ dailySales.length }}
            </dd>
          </div>
          <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg">
            <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Revenue</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
              {{ formatCurrency(totalRevenue) }}
            </dd>
          </div>
          <div class="bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg">
            <dt class="text-xs sm:text-sm font-medium text-gray-500">Total Profit</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold" :class="dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(dailyProfit) }}
            </dd>
          </div>
          <div class="bg-green-50 px-3 py-3 sm:px-4 sm:py-4 md:px-4 md:py-5 rounded-lg border border-green-200 col-span-2 sm:col-span-1">
            <dt class="text-xs sm:text-sm font-medium text-green-600 mb-1">Balance C/D</dt>
            <dd v-if="!userStore.isAdmin && balanceCDSaved !== null" class="text-lg sm:text-xl md:text-2xl font-semibold text-green-700">
              {{ formatCurrency(balanceCDSaved) }}
            </dd>
            <dd v-else-if="!userStore.isAdmin && balanceCDSaved === null" class="text-sm text-gray-500">
              Not set
            </dd>
            <dd v-else class="flex items-center gap-2">
              <input
                v-model="balanceCD"
                type="number"
                step="0.01"
                placeholder="Enter balance"
                class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm px-2 py-1.5"
              />
              <button
                @click="saveBalanceCD"
                :disabled="savingBalance"
                class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
              >
                {{ savingBalance ? '...' : 'Save' }}
              </button>
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
import { onMounted, ref, computed, watch } from 'vue'
import { useSalesStore } from '../../stores/salesStore'
import { useExpensesBankingStore } from '../../stores/expensesBankingStore'
import { useUserStore } from '../../stores/userStore'
import Table from '../../components/Table.vue'
import { getDefaultCurrency } from '../../utils/supabase'

const salesStore = useSalesStore()
const expensesBankingStore = useExpensesBankingStore()
const userStore = useUserStore()
const currency = getDefaultCurrency()
const selectedDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')
const balanceBD = ref(0)
const balanceCD = ref('')
const balanceCDSaved = ref(null)
const savingBalance = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const dailySales = computed(() => {
  if (!salesStore.sales || salesStore.sales.length === 0) return []
  if (!selectedDate.value) return salesStore.dailySales || []
  return salesStore.sales.filter(sale => {
    if (!sale || !sale.sold_at) return false
    const saleDate = new Date(sale.sold_at).toISOString().split('T')[0]
    return saleDate === selectedDate.value
  })
})

const filteredSales = computed(() => {
  if (!dailySales.value || dailySales.value.length === 0) return []
  if (!searchQuery.value.trim()) {
    return dailySales.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return dailySales.value.filter(sale => {
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

const totalRevenue = computed(() => {
  if (!dailySales.value || dailySales.value.length === 0) return 0
  return dailySales.value.reduce((sum, sale) => {
    if (!sale || !sale.selling_price || !sale.quantity) return sum
    return sum + (sale.selling_price * sale.quantity)
  }, 0)
})

const dailyProfit = computed(() => {
  if (!dailySales.value || dailySales.value.length === 0) return 0
  return dailySales.value.reduce((sum, sale) => {
    return sum + (sale.profit || 0)
  }, 0)
})

const columns = [
  { key: 'product_name', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'selling_price', label: 'Selling Price', type: 'currency' },
  { key: 'profit', label: 'Profit/Loss' },
  { key: 'sold_at', label: 'Time', type: 'datetime' },
]

onMounted(async () => {
  salesStore.fetchSales()
  await expensesBankingStore.fetchDailyBalances()
  await loadBalances()
})

async function loadBalances() {
  balanceBD.value = await expensesBankingStore.getBalanceBD(selectedDate.value)
  const savedCD = await expensesBankingStore.getBalanceCD(selectedDate.value)
  balanceCDSaved.value = savedCD
  balanceCD.value = savedCD !== null ? savedCD.toString() : ''
}

watch(selectedDate, async () => {
  await loadBalances()
})

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

async function saveBalanceCD() {
  if (!balanceCD.value || isNaN(parseFloat(balanceCD.value))) return
  savingBalance.value = true
  try {
    await expensesBankingStore.saveBalanceCD(selectedDate.value, parseFloat(balanceCD.value))
    balanceCDSaved.value = parseFloat(balanceCD.value)
    showToast('Balance C/D saved successfully!', 'success')
  } catch (error) {
    console.error('Error saving balance:', error)
    showToast('Failed to save balance. Please try again.', 'error')
  } finally {
    savingBalance.value = false
  }
}

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

