<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

    <div v-if="loading" class="flex flex-col items-center justify-center py-8 sm:py-12">
      <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-sm text-gray-600">Loading dashboard...</p>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <div v-if="userStore.isAdmin" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-4 md:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-xs sm:text-sm font-bold">P</span>
                </div>
              </div>
              <div class="ml-2 sm:ml-3 md:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-700 truncate">Total Products</dt>
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
                  <dt class="text-xs sm:text-sm font-medium text-gray-700 truncate">Total Sales</dt>
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
                  <dt class="text-xs sm:text-sm font-medium text-gray-700 truncate">Today's Revenue</dt>
                  <dd class="text-base sm:text-lg font-medium text-gray-900">
                    {{ formatCurrency(dailySalesAmount) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div v-if="userStore.isAdmin" class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-3 sm:p-4 md:p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-xs sm:text-sm font-bold">!</span>
                </div>
              </div>
              <div class="ml-2 sm:ml-3 md:ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-xs sm:text-sm font-medium text-gray-700 truncate">Low Stock Items</dt>
                  <dd class="text-base sm:text-lg font-medium text-gray-900">{{ lowStockCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only: Today's Cash Flow Summary -->
      <div v-if="userStore.isAdmin" class="bg-white shadow rounded-lg">
        <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Today's Cash Flow</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            <div class="bg-blue-50 px-3 py-3 rounded-lg border border-blue-200">
              <dt class="text-xs font-medium text-blue-600">Opening Balance</dt>
              <dd class="mt-1 text-lg font-semibold text-blue-700">{{ formatCurrency(balanceBD) }}</dd>
            </div>
            <div class="bg-green-50 px-3 py-3 rounded-lg border border-green-200">
              <dt class="text-xs font-medium text-green-600">Total Sales</dt>
              <dd class="mt-1 text-lg font-semibold text-green-700">{{ formatCurrency(dailySalesAmount) }}</dd>
            </div>
            <div class="bg-purple-50 px-3 py-3 rounded-lg border border-purple-200">
              <dt class="text-xs font-medium text-purple-600">Debts Collected</dt>
              <dd class="mt-1 text-lg font-semibold text-purple-700">{{ formatCurrency(dailyDebtsCollected) }}</dd>
            </div>
            <div class="bg-red-50 px-3 py-3 rounded-lg border border-red-200">
              <dt class="text-xs font-medium text-red-600">Expenses</dt>
              <dd class="mt-1 text-lg font-semibold text-red-700">{{ formatCurrency(dailyExpenses) }}</dd>
            </div>
            <div class="bg-orange-50 px-3 py-3 rounded-lg border border-orange-200">
              <dt class="text-xs font-medium text-orange-600">Creditors Paid</dt>
              <dd class="mt-1 text-lg font-semibold text-orange-700">{{ formatCurrency(dailyCreditorsPaid) }}</dd>
            </div>
            <div class="bg-cyan-50 px-3 py-3 rounded-lg border border-cyan-200">
              <dt class="text-xs font-medium text-cyan-600">Bank Deposits</dt>
              <dd class="mt-1 text-lg font-semibold text-cyan-700">{{ formatCurrency(dailyBankDeposits) }}</dd>
            </div>
            <div class="bg-yellow-50 px-3 py-3 rounded-lg border border-yellow-200">
              <dt class="text-xs font-medium text-yellow-600">New Debts</dt>
              <dd class="mt-1 text-lg font-semibold text-yellow-700">{{ formatCurrency(dailyNewDebts) }}</dd>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-indigo-50 px-4 py-4 rounded-lg border border-indigo-200">
                <dt class="text-sm font-medium text-indigo-600">Expected Cash</dt>
                <dd class="mt-1 text-xl font-bold text-indigo-700">{{ formatCurrency(expectedCash) }}</dd>
              </div>
              <div class="bg-teal-50 px-4 py-4 rounded-lg border border-teal-200">
                <dt class="text-sm font-medium text-teal-600">Closing Balance</dt>
                <dd class="mt-1 text-xl font-bold text-teal-700">
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
                  <p v-if="userStore.isAdmin" class="text-xs" :class="sale.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(sale.profit) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="userStore.isAdmin" class="bg-white shadow rounded-lg">
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

      <!-- Today's Expenses & Bank Deposits -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Today's Expenses</h3>
            <div v-if="dailyExpensesList.length === 0" class="text-sm text-gray-500">
              No expenses today
            </div>
            <div v-else class="space-y-3 max-h-64 overflow-y-auto">
              <div
                v-for="expense in dailyExpensesList"
                :key="expense.id"
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <p class="text-sm font-medium text-gray-900">{{ expense.title }}</p>
                <p class="text-sm font-medium text-red-600">{{ formatCurrency(expense.amount) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Today's Bank Deposits</h3>
            <div v-if="dailyBankDepositsList.length === 0" class="text-sm text-gray-500">
              No bank deposits today
            </div>
            <div v-else class="space-y-3 max-h-64 overflow-y-auto">
              <div
                v-for="deposit in dailyBankDepositsList"
                :key="deposit.id"
                class="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ deposit.banks?.name }}</p>
                  <p class="text-xs text-gray-500">{{ deposit.agent_name }}</p>
                </div>
                <p class="text-sm font-medium text-cyan-600">{{ formatCurrency(deposit.amount) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Only: Debtors & Creditors Summary -->
      <div v-if="userStore.isAdmin" class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Total Debtors Owed</h3>
              <span class="text-xl font-bold text-red-600">{{ formatCurrency(totalDebtorsRemaining) }}</span>
            </div>
            <div v-if="dailyNewDebtorsList.length > 0">
              <p class="text-sm font-medium text-gray-700 mb-2">New Debtors Today:</p>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="debtor in dailyNewDebtorsList"
                  :key="debtor.id"
                  class="flex justify-between items-center py-2 border-b border-gray-200"
                >
                  <p class="text-sm text-gray-900">{{ debtor.name }}</p>
                  <p class="text-sm font-medium text-yellow-600">{{ formatCurrency(debtor.total_amount) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">No new debtors today</div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Total Owed to Creditors</h3>
              <span class="text-xl font-bold text-orange-600">{{ formatCurrency(totalCreditorsRemaining) }}</span>
            </div>
            <div v-if="dailyCreditorsPaidList.length > 0">
              <p class="text-sm font-medium text-gray-700 mb-2">Paid to Creditors Today:</p>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="payment in dailyCreditorsPaidList"
                  :key="payment.id"
                  class="flex justify-between items-center py-2 border-b border-gray-200"
                >
                  <p class="text-sm text-gray-900">{{ payment.creditors?.name }}</p>
                  <p class="text-sm font-medium text-orange-600">{{ formatCurrency(payment.amount) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">No payments to creditors today</div>
          </div>
        </div>
      </div>

      <div v-if="userStore.isAdmin" class="bg-white shadow rounded-lg">
        <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Profit Summary</h3>
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
