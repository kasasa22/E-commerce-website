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

    <!-- Cash Flow Summary -->
    <div class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Cash Flow Summary</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          <div class="bg-blue-50 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border border-blue-200">
            <dt class="text-xs sm:text-sm font-medium text-blue-600">Opening Balance</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-blue-700">
              {{ formatCurrency(balanceBD) }}
            </dd>
          </div>
          <div class="bg-green-50 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border border-green-200">
            <dt class="text-xs sm:text-sm font-medium text-green-600">Total Sales</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-green-700">
              {{ formatCurrency(totalRevenue) }}
            </dd>
          </div>
          <div class="px-3 py-3 sm:px-4 sm:py-4 rounded-lg border" :class="totalProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'">
            <dt class="text-xs sm:text-sm font-medium" :class="totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'">Total Profit</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold" :class="totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'">
              {{ formatCurrency(totalProfit) }}
            </dd>
          </div>
          <div class="bg-purple-50 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border border-purple-200">
            <dt class="text-xs sm:text-sm font-medium text-purple-600">Debts Collected</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-purple-700">
              {{ formatCurrency(dailyDebtsCollected) }}
            </dd>
          </div>
          <div class="bg-red-50 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border border-red-200">
            <dt class="text-xs sm:text-sm font-medium text-red-600">Expenses</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-red-700">
              {{ formatCurrency(dailyExpenses) }}
            </dd>
          </div>
          <div class="bg-orange-50 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border border-orange-200">
            <dt class="text-xs sm:text-sm font-medium text-orange-600">Creditors Paid</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-orange-700">
              {{ formatCurrency(dailyCreditorsPaid) }}
            </dd>
          </div>
          <div class="bg-cyan-50 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border border-cyan-200">
            <dt class="text-xs sm:text-sm font-medium text-cyan-600">Bank Deposits</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-cyan-700">
              {{ formatCurrency(dailyBankDeposits) }}
            </dd>
          </div>
          <div class="bg-yellow-50 px-3 py-3 sm:px-4 sm:py-4 rounded-lg border border-yellow-200">
            <dt class="text-xs sm:text-sm font-medium text-yellow-600">New Debts</dt>
            <dd class="mt-1 text-lg sm:text-xl md:text-2xl font-semibold text-yellow-700">
              {{ formatCurrency(dailyNewDebts) }}
            </dd>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-indigo-50 px-4 py-4 rounded-lg border border-indigo-200">
              <dt class="text-sm font-medium text-indigo-600">Expected Cash</dt>
              <dd class="mt-1 text-xl sm:text-2xl font-bold text-indigo-700">
                {{ formatCurrency(expectedCash) }}
              </dd>
              <p class="text-xs text-indigo-500 mt-1">
                Opening + Sales + Debts Collected - Expenses - Creditors Paid - Bank Deposits
              </p>
            </div>
            <div class="bg-teal-50 px-4 py-4 rounded-lg border border-teal-200">
              <dt class="text-sm font-medium text-teal-600 mb-1">Closing Balance</dt>
              <dd v-if="!userStore.isAdmin && balanceCDSaved !== null" class="text-xl sm:text-2xl font-bold text-teal-700">
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
                  class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm px-2 py-1.5"
                />
                <button
                  @click="saveBalanceCD"
                  :disabled="savingBalance"
                  class="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {{ savingBalance ? '...' : 'Save' }}
                </button>
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Expenses Section -->
    <div v-if="dailyExpensesList.length > 0" class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Expenses ({{ dailyExpensesList.length }})
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="expense in dailyExpensesList" :key="expense.id">
                <td class="px-4 py-2 text-sm text-gray-900">{{ expense.title }}</td>
                <td class="px-4 py-2 text-sm text-red-600 text-right font-medium">{{ formatCurrency(expense.amount) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td class="px-4 py-2 text-sm font-bold text-gray-900">Total</td>
                <td class="px-4 py-2 text-sm font-bold text-red-600 text-right">{{ formatCurrency(dailyExpenses) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- New Debtors of the Day -->
    <div v-if="dailyNewDebtorsList.length > 0" class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          New Debtors Today ({{ dailyNewDebtorsList.length }})
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="debtor in dailyNewDebtorsList" :key="debtor.id">
                <td class="px-4 py-2 text-sm text-gray-900">{{ debtor.name }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ debtor.description || '-' }}</td>
                <td class="px-4 py-2 text-sm text-yellow-600 text-right font-medium">{{ formatCurrency(debtor.total_amount) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="2" class="px-4 py-2 text-sm font-bold text-gray-900">Total</td>
                <td class="px-4 py-2 text-sm font-bold text-yellow-600 text-right">{{ formatCurrency(dailyNewDebts) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Debts Collected Today -->
    <div v-if="dailyDebtsCollectedList.length > 0" class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Debts Collected Today ({{ dailyDebtsCollectedList.length }})
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Debtor</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="payment in dailyDebtsCollectedList" :key="payment.id">
                <td class="px-4 py-2 text-sm text-gray-900">{{ payment.debtors?.name || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ payment.notes || '-' }}</td>
                <td class="px-4 py-2 text-sm text-purple-600 text-right font-medium">{{ formatCurrency(payment.amount) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="2" class="px-4 py-2 text-sm font-bold text-gray-900">Total</td>
                <td class="px-4 py-2 text-sm font-bold text-purple-600 text-right">{{ formatCurrency(dailyDebtsCollected) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Creditors Paid Today -->
    <div v-if="dailyCreditorsPaidList.length > 0" class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Creditors Paid Today ({{ dailyCreditorsPaidList.length }})
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creditor</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="payment in dailyCreditorsPaidList" :key="payment.id">
                <td class="px-4 py-2 text-sm text-gray-900">{{ payment.creditors?.name || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ payment.notes || '-' }}</td>
                <td class="px-4 py-2 text-sm text-orange-600 text-right font-medium">{{ formatCurrency(payment.amount) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="2" class="px-4 py-2 text-sm font-bold text-gray-900">Total</td>
                <td class="px-4 py-2 text-sm font-bold text-orange-600 text-right">{{ formatCurrency(dailyCreditorsPaid) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Bank Deposits Today -->
    <div v-if="dailyBankDepositsList.length > 0" class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <div class="flex justify-between items-center mb-3 sm:mb-4">
          <h2 class="text-base sm:text-lg font-medium text-gray-900">
            Bank Deposits Today ({{ dailyBankDepositsList.length }})
          </h2>
          <router-link
            :to="{ name: 'bank-deposits-details', query: { date: selectedDate } }"
            class="text-sm text-cyan-600 hover:text-cyan-800 font-medium"
          >
            View Details &rarr;
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Transactions</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="group in dailyBankDepositsGrouped" :key="group.bank_id">
                <td class="px-4 py-2 text-sm text-gray-900">{{ group.bank_name }}</td>
                <td class="px-4 py-2 text-sm text-gray-500 text-center">{{ group.count }}</td>
                <td class="px-4 py-2 text-sm text-cyan-600 text-right font-medium">{{ formatCurrency(group.total) }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td class="px-4 py-2 text-sm font-bold text-gray-900">Total</td>
                <td class="px-4 py-2 text-sm font-bold text-gray-500 text-center">{{ dailyBankDepositsList.length }}</td>
                <td class="px-4 py-2 text-sm font-bold text-cyan-600 text-right">{{ formatCurrency(dailyBankDeposits) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Sales Section -->
    <div class="bg-white shadow sm:rounded-lg mb-4 sm:mb-6">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Sales ({{ dailySales.length }})
        </h2>

        <div v-if="salesStore.loading" class="text-center py-8">
          <p class="text-gray-500">Loading sales...</p>
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
                placeholder="Search sales by product name..."
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

          <div v-else class="overflow-hidden" id="report-table">
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
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useSalesStore } from '../../stores/salesStore'
import { useExpensesBankingStore } from '../../stores/expensesBankingStore'
import { useFinanceStore } from '../../stores/financeStore'
import { useUserStore } from '../../stores/userStore'
import Table from '../../components/Table.vue'
import { formatCurrency, getDateString } from '../../utils/formatters'

const salesStore = useSalesStore()
const expensesBankingStore = useExpensesBankingStore()
const financeStore = useFinanceStore()
const userStore = useUserStore()
const selectedDate = ref(new Date().toISOString().split('T')[0])
const searchQuery = ref('')
const balanceBD = ref(0)
const balanceCD = ref('')
const balanceCDSaved = ref(null)
const savingBalance = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

// Daily Sales
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

const totalProfit = computed(() => {
  if (!dailySales.value || dailySales.value.length === 0) return 0
  return dailySales.value.reduce((sum, sale) => {
    if (!sale || sale.profit === undefined) return sum
    return sum + Number(sale.profit)
  }, 0)
})

// Daily Expenses
const dailyExpensesList = computed(() => {
  if (!expensesBankingStore.expenses || expensesBankingStore.expenses.length === 0) return []
  return expensesBankingStore.expenses.filter(e => e.expense_date === selectedDate.value)
})

const dailyExpenses = computed(() => {
  return dailyExpensesList.value.reduce((sum, e) => sum + Number(e.amount), 0)
})

const dailyNewDebtorsList = computed(() => {
  if (!financeStore.debtors || financeStore.debtors.length === 0) return []
  return financeStore.debtors.filter(d => {
    if (!d.created_at) return false
    return getDateString(d.created_at) === selectedDate.value
  })
})

const dailyNewDebts = computed(() => {
  return dailyNewDebtorsList.value.reduce((sum, d) => sum + Number(d.total_amount), 0)
})

const dailyDebtsCollectedList = computed(() => {
  if (!financeStore.payments || financeStore.payments.length === 0) return []
  return financeStore.payments.filter(p => {
    if (!p.payment_date || !p.debtor_id) return false
    return getDateString(p.payment_date) === selectedDate.value
  })
})

const dailyDebtsCollected = computed(() => {
  return dailyDebtsCollectedList.value.reduce((sum, p) => sum + Number(p.amount), 0)
})

const dailyCreditorsPaidList = computed(() => {
  if (!financeStore.payments || financeStore.payments.length === 0) return []
  return financeStore.payments.filter(p => {
    if (!p.payment_date || !p.creditor_id) return false
    return getDateString(p.payment_date) === selectedDate.value
  })
})

const dailyCreditorsPaid = computed(() => {
  return dailyCreditorsPaidList.value.reduce((sum, p) => sum + Number(p.amount), 0)
})

const dailyBankDepositsList = computed(() => {
  if (!expensesBankingStore.deposits || expensesBankingStore.deposits.length === 0) return []
  return expensesBankingStore.deposits.filter(d => d.deposit_date === selectedDate.value)
})

const dailyBankDeposits = computed(() => {
  return dailyBankDepositsList.value.reduce((sum, d) => sum + Number(d.amount), 0)
})

const dailyBankDepositsGrouped = computed(() => {
  if (!dailyBankDepositsList.value || dailyBankDepositsList.value.length === 0) return []
  const grouped = {}
  dailyBankDepositsList.value.forEach(d => {
    const bankId = d.bank_id
    const bankName = d.banks?.name || 'Unknown Bank'
    if (!grouped[bankId]) {
      grouped[bankId] = {
        bank_id: bankId,
        bank_name: bankName,
        total: 0,
        count: 0
      }
    }
    grouped[bankId].total += Number(d.amount)
    grouped[bankId].count++
  })
  return Object.values(grouped)
})

const expectedCash = computed(() => {
  return balanceBD.value + totalRevenue.value + dailyDebtsCollected.value - dailyExpenses.value - dailyCreditorsPaid.value - dailyBankDeposits.value
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
  expensesBankingStore.fetchExpenses()
  expensesBankingStore.fetchDeposits()
  await expensesBankingStore.fetchDailyBalances()
  await financeStore.fetchDebtors()
  await financeStore.fetchCreditors()
  await financeStore.fetchAllPayments()
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
    showToast('Closing Balance saved successfully!', 'success')
  } catch (error) {
    console.error('Error saving balance:', error)
    showToast('Failed to save balance. Please try again.', 'error')
  } finally {
    savingBalance.value = false
  }
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
