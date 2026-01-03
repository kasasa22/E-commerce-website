<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
      <div class="flex items-center gap-3">
        <router-link
          :to="backRoute"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
          {{ pageTitle }}
        </h1>
      </div>
      <div class="flex gap-2 sm:gap-3 w-full sm:w-auto">
        <input
          v-if="!filterByBank"
          v-model="selectedDate"
          type="date"
          class="flex-1 sm:flex-none sm:w-auto rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
          @change="fetchData"
        />
        <button
          @click="printReport"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
        >
          Print
        </button>
      </div>
    </div>

    <!-- Summary Card -->
    <div class="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-4 mb-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm font-medium text-cyan-600">
            {{ filterByBank ? `Total Deposits for ${bankName}` : `Total Deposits for ${formatDate(selectedDate)}` }}
          </p>
          <p class="text-2xl font-bold text-cyan-700">{{ formatCurrency(totalDeposits) }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-cyan-600">{{ deposits.length }} transactions</p>
          <p v-if="!filterByBank" class="text-sm text-cyan-600">{{ uniqueBanks }} banks</p>
        </div>
      </div>
    </div>

    <!-- Deposits Table -->
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">Loading deposits...</p>
        </div>

        <div v-else-if="deposits.length === 0" class="text-center py-8">
          <p class="text-gray-500">No bank deposits found{{ filterByBank ? '' : ' for this date' }}.</p>
        </div>

        <div v-else class="overflow-x-auto" id="report-table">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-if="!filterByBank" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ filterByBank ? 'Date' : 'Time' }}</th>
                <th v-if="userStore.isAdmin" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="deposit in deposits" :key="deposit.id">
                <td v-if="!filterByBank" class="px-4 py-2 text-sm text-gray-900">{{ deposit.banks?.name || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ deposit.agent_name || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ deposit.reference_number || '-' }}</td>
                <td class="px-4 py-2 text-sm text-cyan-600 text-right font-medium">{{ formatCurrency(deposit.amount) }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ filterByBank ? formatDateShort(deposit.deposit_date) : formatTime(deposit.created_at) }}</td>
                <td v-if="userStore.isAdmin" class="px-4 py-2 text-sm text-right">
                  <button @click="editDeposit(deposit)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button @click="deleteDeposit(deposit)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td :colspan="filterByBank ? 2 : 3" class="px-4 py-2 text-sm font-bold text-gray-900">Total</td>
                <td class="px-4 py-2 text-sm font-bold text-cyan-600 text-right">{{ formatCurrency(totalDeposits) }}</td>
                <td></td>
                <td v-if="userStore.isAdmin"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExpensesBankingStore } from '../../stores/expensesBankingStore'
import { useUserStore } from '../../stores/userStore'
import { getDefaultCurrency } from '../../utils/supabase'

const route = useRoute()
const router = useRouter()
const expensesBankingStore = useExpensesBankingStore()
const userStore = useUserStore()
const currency = getDefaultCurrency()

const selectedDate = ref(route.query.date || new Date().toISOString().split('T')[0])
const bankId = ref(route.query.bank_id || null)
const loading = ref(false)

const filterByBank = computed(() => !!bankId.value)

const bankName = computed(() => {
  if (!bankId.value) return ''
  const deposit = expensesBankingStore.deposits.find(d => d.bank_id === bankId.value)
  return deposit?.banks?.name || 'Unknown Bank'
})

const pageTitle = computed(() => {
  if (filterByBank.value) {
    return `${bankName.value} - Deposits`
  }
  return 'Bank Deposits Details'
})

const backRoute = computed(() => {
  if (filterByBank.value) {
    return { name: 'banking' }
  }
  return { name: 'reports-daily' }
})

const deposits = computed(() => {
  if (!expensesBankingStore.deposits || expensesBankingStore.deposits.length === 0) return []

  if (filterByBank.value) {
    // Filter by bank ID (all deposits for this bank)
    return expensesBankingStore.deposits.filter(d => d.bank_id === bankId.value)
  }
  // Filter by date
  return expensesBankingStore.deposits.filter(d => d.deposit_date === selectedDate.value)
})

const totalDeposits = computed(() => {
  return deposits.value.reduce((sum, d) => sum + Number(d.amount), 0)
})

const uniqueBanks = computed(() => {
  const banks = new Set(deposits.value.map(d => d.bank_id))
  return banks.size
})

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    await expensesBankingStore.fetchDeposits()
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function printReport() {
  window.print()
}

function editDeposit(deposit) {
  // Navigate to banking page with edit state (could also use a modal here)
  router.push({ name: 'banking', query: { edit: deposit.id } })
}

async function deleteDeposit(deposit) {
  if (confirm('Are you sure you want to delete this deposit?')) {
    try {
      await expensesBankingStore.deleteDeposit(deposit.id)
      await fetchData()
    } catch (error) {
      alert('Failed to delete deposit: ' + error.message)
    }
  }
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
