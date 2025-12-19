<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Finance Management</h1>
        <p class="text-sm text-gray-500 mt-1">Manage your debtors and creditors in one place.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="openAddModal"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Entry
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
          ]"
        >
          {{ tab.name }}
          <span
            v-if="tab.count > 0"
            :class="[
              activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900',
              'ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium inline-block'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-red-50 text-red-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Debtors (Remaining)</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalDebtorsRemaining) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-green-50 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Creditors (Remaining)</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalCreditorsRemaining) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-50 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Net Balance</p>
            <p class="text-2xl font-bold text-gray-900" :class="netBalance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(netBalance) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="financeStore.loading" class="p-12 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-500">Loading data...</p>
      </div>

      <div v-else-if="currentData.length === 0" class="p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">No {{ activeTab }} found</h3>
        <p class="text-gray-500 mt-1">Get started by adding your first {{ activeTab.slice(0, -1) }}.</p>
        <button
          @click="openAddModal"
          class="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add {{ activeTab.slice(0, -1) }}
        </button>
      </div>

      <div v-else>
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in currentData" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                  <div class="text-xs text-gray-500 truncate max-w-xs">{{ item.description || 'No description' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatCurrency(item.total_amount) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(item.remaining_amount) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(item.due_date) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      item.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      item.status === 'partial' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800',
                      'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize'
                    ]"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <router-link
                    :to="{ name: 'finance-details', params: { type: activeTab === 'debtors' ? 'debtor' : 'creditor', id: item.id } }"
                    class="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View Details
                    <svg class="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="md:hidden divide-y divide-gray-200">
        <div v-for="item in currentData" :key="item.id" class="p-4 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-sm font-bold text-gray-900">{{ item.name }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.due_date) }}</div>
            </div>
            <span
              :class="[
                item.status === 'paid' ? 'bg-green-100 text-green-800' : 
                item.status === 'partial' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800',
                'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize'
              ]"
            >
              {{ item.status }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4 py-2">
            <div>
              <p class="text-xs text-gray-500 uppercase font-semibold">Total</p>
              <p class="text-sm text-gray-900">{{ formatCurrency(item.total_amount) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase font-semibold">Remaining</p>
              <p class="text-sm font-bold text-blue-600">{{ formatCurrency(item.remaining_amount) }}</p>
            </div>
          </div>
          <router-link
            :to="{ name: 'finance-details', params: { type: activeTab === 'debtors' ? 'debtor' : 'creditor', id: item.id } }"
            class="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            View Details
          </router-link>
        </div>
      </div>
    </div>
  </div>

    <!-- Add Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6">
              Add New {{ activeTab.slice(0, -1) }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input v-model="form.name" type="text" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Enter name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Total Amount</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">{{ currencySymbol }}</span>
                  </div>
                  <input v-model.number="form.total_amount" type="number" class="block w-full pl-12 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea v-model="form.description" rows="3" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Optional description"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Due Date</label>
                <input v-model="form.due_date" type="date" class="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button @click="saveEntry" :disabled="saving" class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
              <span v-if="saving" class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Save
            </button>
            <button @click="closeModal" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore } from '../../stores/financeStore'
import { useToast } from '../../composables/useToast'
import { getDefaultCurrency } from '../../utils/supabase'

const financeStore = useFinanceStore()
const { showToast } = useToast()

const activeTab = ref('debtors')
const tabs = computed(() => [
  { id: 'debtors', name: 'Debtors', count: financeStore.debtors.length },
  { id: 'creditors', name: 'Creditors', count: financeStore.creditors.length }
])

const currentData = computed(() => {
  return activeTab.value === 'debtors' ? financeStore.debtors : financeStore.creditors
})

const totalDebtorsRemaining = computed(() => {
  return financeStore.debtors.reduce((sum, item) => sum + Number(item.remaining_amount), 0)
})

const totalCreditorsRemaining = computed(() => {
  return financeStore.creditors.reduce((sum, item) => sum + Number(item.remaining_amount), 0)
})

const netBalance = computed(() => {
  return totalDebtorsRemaining.value - totalCreditorsRemaining.value
})

const currencySymbol = computed(() => {
  const currency = getDefaultCurrency()
  return currency === 'UGX' ? 'UGX' : '$'
})

// Modal State
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const form = ref({
  id: null,
  name: '',
  total_amount: 0,
  description: '',
  due_date: ''
})

onMounted(async () => {
  await Promise.all([
    financeStore.fetchDebtors(),
    financeStore.fetchCreditors()
  ])
})

function formatCurrency(amount) {
  const currency = getDefaultCurrency()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(amount || 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

function openAddModal() {
  isEditing.value = false
  form.value = {
    id: null,
    name: '',
    total_amount: 0,
    description: '',
    due_date: ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function saveEntry() {
  if (!form.value.name || form.value.total_amount <= 0) {
    showToast('Please fill in all required fields.', 'error')
    return
  }

  saving.value = true
  try {
    const entryData = {
      name: form.value.name,
      total_amount: form.value.total_amount,
      description: form.value.description,
      due_date: form.value.due_date || null
    }

    if (activeTab.value === 'debtors') {
      await financeStore.addDebtor(entryData)
    } else {
      await financeStore.addCreditor(entryData)
    }
    showToast('Entry added successfully!', 'success')
    closeModal()
  } catch (error) {
    showToast(error.message || 'An error occurred.', 'error')
  } finally {
    saving.value = false
  }
}
</script>
