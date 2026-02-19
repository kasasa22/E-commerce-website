<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div v-if="loading" class="flex flex-col items-center justify-center py-8 sm:py-12">
      <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-sm text-gray-600">Loading dashboard...</p>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <div v-if="userStore.isAdmin" class="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div class="p-4 sm:p-5 md:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-semibold text-blue-100 truncate">Total Products</dt>
                  <dd class="text-xl sm:text-2xl font-bold text-white">{{ productStore.products.length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div class="p-4 sm:p-5 md:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-semibold text-green-100 truncate">Total Sales</dt>
                  <dd class="text-xl sm:text-2xl font-bold text-white">{{ dailySalesCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div class="p-4 sm:p-5 md:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-semibold text-yellow-100 truncate">Today's Revenue</dt>
                  <dd class="text-lg sm:text-xl font-bold text-white truncate">
                    {{ formatCurrency(dailySalesAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div v-if="userStore.isAdmin" class="bg-gradient-to-br from-red-500 to-red-600 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div class="p-4 sm:p-5 md:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-semibold text-red-100 truncate">Low Stock Items</dt>
                  <dd class="text-xl sm:text-2xl font-bold text-white">{{ lowStockCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only: Today's Cash Flow Summary -->
      <div v-if="userStore.isAdmin" class="bg-white shadow-lg rounded-xl border border-gray-200">
        <div class="px-4 py-5 sm:px-6 md:p-8">
          <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-5">Today's Cash Flow</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 px-3 py-4 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs font-semibold text-blue-700">Opening Balance</dt>
              <dd class="mt-2 text-base sm:text-lg font-bold text-blue-900">{{ formatCurrency(balanceBD) }}</dd>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 px-3 py-4 rounded-xl border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs font-semibold text-green-700">Total Sales</dt>
              <dd class="mt-2 text-base sm:text-lg font-bold text-green-900">{{ formatCurrency(dailySalesAmount) }}</dd>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 px-3 py-4 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs font-semibold text-purple-700">Debts Collected</dt>
              <dd class="mt-2 text-base sm:text-lg font-bold text-purple-900">{{ formatCurrency(dailyDebtsCollected) }}</dd>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-red-100 px-3 py-4 rounded-xl border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs font-semibold text-red-700">Expenses</dt>
              <dd class="mt-2 text-base sm:text-lg font-bold text-red-900">{{ formatCurrency(dailyExpenses) }}</dd>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 px-3 py-4 rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs font-semibold text-orange-700">Creditors Paid</dt>
              <dd class="mt-2 text-base sm:text-lg font-bold text-orange-900">{{ formatCurrency(dailyCreditorsPaid) }}</dd>
            </div>
            <div class="bg-gradient-to-br from-cyan-50 to-cyan-100 px-3 py-4 rounded-xl border-2 border-cyan-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs font-semibold text-cyan-700">Bank Deposits</dt>
              <dd class="mt-2 text-base sm:text-lg font-bold text-cyan-900">{{ formatCurrency(dailyBankDeposits) }}</dd>
            </div>
            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 px-3 py-4 rounded-xl border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs font-semibold text-yellow-700">New Debts</dt>
              <dd class="mt-2 text-base sm:text-lg font-bold text-yellow-900">{{ formatCurrency(dailyNewDebts) }}</dd>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t-2 border-gray-200">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 px-5 py-5 rounded-xl border-2 border-indigo-300 shadow-md">
                <dt class="text-sm font-semibold text-indigo-700">Expected Cash</dt>
                <dd class="mt-2 text-2xl font-bold text-indigo-900">{{ formatCurrency(expectedCash) }}</dd>
              </div>
              <div class="bg-gradient-to-br from-teal-50 to-teal-100 px-5 py-5 rounded-xl border-2 border-teal-300 shadow-md">
                <dt class="text-sm font-semibold text-teal-700">Closing Balance</dt>
                <dd class="mt-2 text-2xl font-bold text-teal-900">
                  {{ balanceCDSaved !== null ? formatCurrency(balanceCDSaved) : 'Not set' }}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only: Spending Breakdown Pie Chart -->
      <div v-if="userStore.isAdmin && spendingData.length > 0" class="bg-white shadow rounded-lg">
        <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Today's Spending Breakdown</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex justify-center">
              <div class="w-64 h-64">
                <PieChart
                  :data="spendingData"
                  :size="250"
                  :donut="true"
                  :showLegend="false"
                  :formatValue="formatCurrency"
                />
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="(item, index) in spendingData" :key="index" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="w-4 h-4 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="font-medium text-gray-700">{{ item.label }}</span>
                </div>
                <span class="font-bold text-gray-900">{{ formatCurrency(item.value) }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-100 rounded-lg border-2 border-gray-300">
                <span class="font-bold text-gray-700">Total Spending</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(totalSpending) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="bg-white shadow-lg rounded-xl border border-gray-200">
          <div class="px-5 py-6">
            <h3 class="text-lg font-bold text-gray-900 mb-5">Today's Sales</h3>
            <div v-if="dailySales.length === 0" class="text-center py-8 text-sm text-gray-500">
              No sales today
            </div>
            <div v-else class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="sale in dailySales"
                :key="sale.id"
                class="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <div>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ sale.products?.name || 'Unknown Product' }}
                  </p>
                  <p class="text-xs font-medium text-gray-500 mt-0.5">
                    {{ new Date(sale.sold_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-gray-900">
                    {{ formatCurrency(sale.selling_price * sale.quantity) }}
                  </p>
                  <p v-if="userStore.isAdmin" class="text-xs font-semibold mt-0.5" :class="sale.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(sale.profit) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="userStore.isAdmin" class="bg-white shadow-lg rounded-xl border border-gray-200">
          <div class="px-5 py-6">
            <h3 class="text-lg font-bold text-gray-900 mb-5">Low Stock Alerts</h3>
            <div v-if="lowStockProducts.length === 0" class="text-center py-8 text-sm text-gray-500">
              All products are well stocked
            </div>
            <div v-else class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="product in lowStockProducts"
                :key="product.id"
                class="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-red-50 border border-red-100 transition-colors"
              >
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ product.name }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-red-600">{{ product.quantity }} left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Expenses & Bank Deposits -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="bg-white shadow-lg rounded-xl border border-gray-200">
          <div class="px-5 py-6">
            <h3 class="text-lg font-bold text-gray-900 mb-5">Today's Expenses</h3>
            <div v-if="dailyExpensesList.length === 0" class="text-center py-8 text-sm text-gray-500">
              No expenses today
            </div>
            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="expense in dailyExpensesList"
                :key="expense.id"
                class="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-red-50 border border-gray-100 transition-colors"
              >
                <p class="text-sm font-semibold text-gray-900">{{ expense.title }}</p>
                <p class="text-sm font-bold text-red-600">{{ formatCurrency(expense.amount) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl border border-gray-200">
          <div class="px-5 py-6">
            <h3 class="text-lg font-bold text-gray-900 mb-5">Today's Bank Deposits</h3>
            <div v-if="dailyBankDepositsList.length === 0" class="text-center py-8 text-sm text-gray-500">
              No bank deposits today
            </div>
            <div v-else class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="deposit in dailyBankDepositsList"
                :key="deposit.id"
                class="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-cyan-50 border border-gray-100 transition-colors"
              >
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ deposit.banks?.name }}</p>
                  <p class="text-xs font-medium text-gray-500">{{ deposit.agent_name }}</p>
                </div>
                <p class="text-sm font-bold text-cyan-600">{{ formatCurrency(deposit.amount) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only: Debtors & Creditors Summary -->
      <div v-if="userStore.isAdmin" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="bg-white shadow-lg rounded-xl border border-gray-200">
          <div class="px-5 py-6">
            <div class="flex justify-between items-center mb-5">
              <h3 class="text-lg font-bold text-gray-900">Total Debtors Owed</h3>
              <span class="text-xl font-bold text-red-600">{{ formatCurrency(totalDebtorsRemaining) }}</span>
            </div>
            <div v-if="dailyNewDebtorsList.length > 0">
              <p class="text-sm font-semibold text-gray-700 mb-3">New Debtors Today:</p>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="debtor in dailyNewDebtorsList"
                  :key="debtor.id"
                  class="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-yellow-50 border border-gray-100 transition-colors"
                >
                  <p class="text-sm font-semibold text-gray-900">{{ debtor.name }}</p>
                  <p class="text-sm font-bold text-yellow-600">{{ formatCurrency(debtor.total_amount) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-sm text-gray-500">No new debtors today</div>
          </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl border border-gray-200">
          <div class="px-5 py-6">
            <div class="flex justify-between items-center mb-5">
              <h3 class="text-lg font-bold text-gray-900">Total Owed to Creditors</h3>
              <span class="text-xl font-bold text-orange-600">{{ formatCurrency(totalCreditorsRemaining) }}</span>
            </div>
            <div v-if="dailyCreditorsPaidList.length > 0">
              <p class="text-sm font-semibold text-gray-700 mb-3">Paid to Creditors Today:</p>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="payment in dailyCreditorsPaidList"
                  :key="payment.id"
                  class="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-orange-50 border border-gray-100 transition-colors"
                >
                  <p class="text-sm font-semibold text-gray-900">{{ payment.creditors?.name }}</p>
                  <p class="text-sm font-bold text-orange-600">{{ formatCurrency(payment.amount) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-sm text-gray-500">No payments to creditors today</div>
          </div>
        </div>
      </div>

      <div v-if="userStore.isAdmin" class="bg-white shadow-lg rounded-xl border border-gray-200">
        <div class="px-5 py-6 md:p-8">
          <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-5">Profit Summary</h3>
          <div class="grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 px-5 py-5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs sm:text-sm font-semibold text-gray-600">Today's Profit</dt>
              <dd class="mt-2 text-xl sm:text-2xl md:text-3xl font-bold" :class="salesStore.dailyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salesStore.dailyProfit) }}
              </dd>
            </div>
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 px-5 py-5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <dt class="text-xs sm:text-sm font-semibold text-gray-600">This Month's Profit</dt>
              <dd class="mt-2 text-xl sm:text-2xl md:text-3xl font-bold" :class="salesStore.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(salesStore.monthlyProfit) }}
              </dd>
            </div>
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 px-5 py-5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <dt class="text-xs sm:text-sm font-semibold text-gray-600">This Year's Profit</dt>
              <dd class="mt-2 text-xl sm:text-2xl md:text-3xl font-bold" :class="salesStore.yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'">
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
import { onMounted, computed, ref } from 'vue'
import { useProductStore } from '../../stores/productStore'
import { useSalesStore } from '../../stores/salesStore'
import { useUserStore } from '../../stores/userStore'
import { useExpensesBankingStore } from '../../stores/expensesBankingStore'
import { useFinanceStore } from '../../stores/financeStore'
import PieChart from '../../components/PieChart.vue'
import { formatCurrency } from '../../utils/formatters'
import { LOW_STOCK_THRESHOLD } from '../../utils/constants'

const productStore = useProductStore()
const salesStore = useSalesStore()
const userStore = useUserStore()
const expensesBankingStore = useExpensesBankingStore()
const financeStore = useFinanceStore()

const today = new Date().toISOString().split('T')[0]
const balanceBD = ref(0)
const balanceCDSaved = ref(null)

const loading = computed(() => productStore.loading || salesStore.loading)

const lowStockProducts = computed(() => {
  return productStore.getLowStockProducts(LOW_STOCK_THRESHOLD)
})

const lowStockCount = computed(() => {
  return productStore.getLowStockProducts(LOW_STOCK_THRESHOLD).length
})

const dailySales = computed(() => {
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

const dailyExpensesList = computed(() => {
  if (!expensesBankingStore.expenses) return []
  return expensesBankingStore.expenses.filter(e => e.expense_date === today)
})

const dailyExpenses = computed(() => {
  return dailyExpensesList.value.reduce((sum, e) => sum + Number(e.amount), 0)
})

const dailyBankDepositsList = computed(() => {
  if (!expensesBankingStore.deposits) return []
  return expensesBankingStore.deposits.filter(d => d.deposit_date === today)
})

const dailyBankDeposits = computed(() => {
  return dailyBankDepositsList.value.reduce((sum, d) => sum + Number(d.amount), 0)
})

function getDateString(dateValue) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dailyNewDebtorsList = computed(() => {
  if (!financeStore.debtors) return []
  return financeStore.debtors.filter(d => {
    if (!d.created_at) return false
    return getDateString(d.created_at) === today
  })
})

const dailyNewDebts = computed(() => {
  return dailyNewDebtorsList.value.reduce((sum, d) => sum + Number(d.total_amount), 0)
})

const dailyDebtsCollectedList = computed(() => {
  if (!financeStore.payments) return []
  return financeStore.payments.filter(p => {
    if (!p.payment_date || !p.debtor_id) return false
    return getDateString(p.payment_date) === today
  })
})

const dailyDebtsCollected = computed(() => {
  return dailyDebtsCollectedList.value.reduce((sum, p) => sum + Number(p.amount), 0)
})

const dailyCreditorsPaidList = computed(() => {
  if (!financeStore.payments) return []
  return financeStore.payments.filter(p => {
    if (!p.payment_date || !p.creditor_id) return false
    return getDateString(p.payment_date) === today
  })
})

const dailyCreditorsPaid = computed(() => {
  return dailyCreditorsPaidList.value.reduce((sum, p) => sum + Number(p.amount), 0)
})

const totalDebtorsRemaining = computed(() => {
  if (!financeStore.debtors) return 0
  return financeStore.debtors.reduce((sum, d) => sum + Number(d.remaining_amount), 0)
})

const totalCreditorsRemaining = computed(() => {
  if (!financeStore.creditors) return 0
  return financeStore.creditors.reduce((sum, c) => sum + Number(c.remaining_amount), 0)
})

const expectedCash = computed(() => {
  return balanceBD.value + dailySalesAmount.value + dailyDebtsCollected.value - dailyExpenses.value - dailyCreditorsPaid.value - dailyBankDeposits.value
})

const spendingData = computed(() => {
  const data = []
  if (dailyExpenses.value > 0) {
    data.push({ label: 'Expenses', value: dailyExpenses.value, color: '#EF4444' })
  }
  if (dailyCreditorsPaid.value > 0) {
    data.push({ label: 'Creditors Paid', value: dailyCreditorsPaid.value, color: '#F97316' })
  }
  if (dailyBankDeposits.value > 0) {
    data.push({ label: 'Bank Deposits', value: dailyBankDeposits.value, color: '#06B6D4' })
  }
  return data
})

const totalSpending = computed(() => {
  return dailyExpenses.value + dailyCreditorsPaid.value + dailyBankDeposits.value
})

async function loadBalances() {
  balanceBD.value = await expensesBankingStore.getBalanceBD(today)
  balanceCDSaved.value = await expensesBankingStore.getBalanceCD(today)
}

onMounted(async () => {
  productStore.fetchProducts()
  salesStore.fetchSales()
  expensesBankingStore.fetchExpenses()
  expensesBankingStore.fetchDeposits()

  if (userStore.isAdmin) {
    await expensesBankingStore.fetchDailyBalances()
    await financeStore.fetchDebtors()
    await financeStore.fetchCreditors()
    await financeStore.fetchAllPayments()
    await loadBalances()
  }
})
</script>
