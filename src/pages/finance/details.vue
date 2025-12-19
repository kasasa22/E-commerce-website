<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <router-link
          :to="{ name: 'finance' }"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ item?.name }}</h1>
          <p class="text-sm text-gray-500 capitalize">{{ type }} Details</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="openEditModal"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          @click="confirmDelete"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>

    <div v-if="loading" class="p-12 flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-500">Loading details...</p>
    </div>

    <div v-else-if="item" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Info Cards -->
      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Summary</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-center lg:block">
              <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Status</p>
              <span
                :class="[
                  item.status === 'paid' ? 'bg-green-100 text-green-800' : 
                  item.status === 'partial' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800',
                  'mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize'
                ]"
              >
                {{ item.status }}
              </span>
            </div>
            <div class="flex justify-between items-center lg:block">
              <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Amount</p>
              <p class="text-lg lg:text-xl font-bold text-gray-900">{{ formatCurrency(item.total_amount) }}</p>
            </div>
            <div class="flex justify-between items-center lg:block">
              <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Remaining Balance</p>
              <p class="text-xl lg:text-2xl font-black text-blue-600">{{ formatCurrency(item.remaining_amount) }}</p>
            </div>
            <div class="flex justify-between items-center lg:block">
              <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Due Date</p>
              <p class="text-sm text-gray-900">{{ formatDate(item.due_date) }}</p>
            </div>
            <div v-if="item.description">
              <p class="text-xs text-gray-500 uppercase font-semibold tracking-wider">Description</p>
              <p class="text-sm text-gray-700 mt-1">{{ item.description }}</p>
            </div>
          </div>
          <div class="p-6 bg-gray-50 border-t border-gray-100">
            <button
              @click="showPaymentModal = true"
              :disabled="item.status === 'paid'"
              class="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Record Payment
            </button>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900">Payment History</h3>
            <span class="text-sm text-gray-500">{{ payments.length }} payments</span>
          </div>
          
          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ new Date(payment.payment_date).toLocaleString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {{ formatCurrency(payment.amount) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ payment.notes || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile List -->
          <div class="md:hidden divide-y divide-gray-200">
            <div v-for="payment in payments" :key="payment.id" class="p-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">{{ new Date(payment.payment_date).toLocaleString() }}</span>
                <span class="text-sm font-bold text-gray-900">{{ formatCurrency(payment.amount) }}</span>
              </div>
              <p v-if="payment.notes" class="text-xs text-gray-600 italic">{{ payment.notes }}</p>
            </div>
          </div>

          <div v-if="payments.length === 0" class="px-6 py-12 text-center text-gray-500">
            No payments recorded yet.
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6">Edit {{ type }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input v-model="editForm.name" type="text" class="block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">{{ currencySymbol }}</span>
                  </div>
                  <input v-model.number="editForm.total_amount" type="number" class="block w-full pl-12 border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2" />
                </div>
                <p class="mt-1 text-xs text-gray-500">Note: Changing total amount will not automatically recalculate remaining balance if payments exist.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea v-model="editForm.description" rows="3" class="block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input v-model="editForm.due_date" type="date" class="block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2" />
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button @click="updateEntry" :disabled="saving" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
              <span v-if="saving" class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Update
            </button>
            <button @click="showEditModal = false" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-6">Record Payment</h3>
            
            <div class="bg-blue-50 p-4 rounded-lg mb-6 flex justify-between items-center">
              <div>
                <p class="text-xs text-blue-600 font-medium uppercase">Remaining Balance</p>
                <p class="text-xl font-bold text-blue-900">{{ formatCurrency(item?.remaining_amount) }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <div class="relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">{{ currencySymbol }}</span>
                  </div>
                  <input v-model.number="paymentForm.amount" type="number" class="block w-full pl-12 border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input v-model="paymentForm.payment_date" type="datetime-local" class="block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea v-model="paymentForm.notes" rows="2" class="block w-full border-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2" placeholder="Optional notes"></textarea>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button @click="submitPayment" :disabled="savingPayment" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
              <span v-if="savingPayment" class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Submit Payment
            </button>
            <button @click="showPaymentModal = false" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-2">Delete Entry</h3>
            <p class="text-sm text-gray-500">Are you sure you want to delete this entry? This action cannot be undone and all payment history will be lost.</p>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button @click="deleteEntry" :disabled="deleting" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
              <span v-if="deleting" class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Delete
            </button>
            <button @click="showDeleteModal = false" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFinanceStore } from '../../stores/financeStore'
import { useToast } from '../../composables/useToast'
import { getDefaultCurrency } from '../../utils/supabase'

const route = useRoute()
const router = useRouter()
const financeStore = useFinanceStore()
const { showToast } = useToast()

const id = route.params.id
const type = route.params.type // 'debtor' or 'creditor'

const item = ref(null)
const payments = ref([])
const loading = ref(true)

const currencySymbol = computed(() => {
  const currency = getDefaultCurrency()
  return currency === 'UGX' ? 'UGX' : '$'
})

// Edit Modal
const showEditModal = ref(false)
const saving = ref(false)
const editForm = ref({
  name: '',
  total_amount: 0,
  description: '',
  due_date: ''
})

// Payment Modal
const showPaymentModal = ref(false)
const savingPayment = ref(false)
const paymentForm = ref({
  amount: 0,
  payment_date: new Date().toISOString().slice(0, 16),
  notes: ''
})

// Delete Modal
const showDeleteModal = ref(false)
const deleting = ref(false)

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    item.value = await financeStore.fetchById(id, type)
    payments.value = await financeStore.fetchPayments(id, type)
    
    // Initialize edit form
    editForm.value = {
      name: item.value.name,
      total_amount: item.value.total_amount,
      description: item.value.description || '',
      due_date: item.value.due_date || ''
    }
    
    // Initialize payment form
    paymentForm.value.amount = item.value.remaining_amount
  } catch (error) {
    showToast('Failed to load details.', 'error')
    router.push({ name: 'finance' })
  } finally {
    loading.value = false
  }
}

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

function openEditModal() {
  showEditModal.value = true
}

async function updateEntry() {
  saving.value = true
  try {
    if (type === 'debtor') {
      await financeStore.updateDebtor(id, editForm.value)
    } else {
      await financeStore.updateCreditor(id, editForm.value)
    }
    showToast('Updated successfully!', 'success')
    showEditModal.value = false
    await fetchData()
  } catch (error) {
    showToast(error.message || 'Failed to update.', 'error')
  } finally {
    saving.value = false
  }
}

async function submitPayment() {
  if (paymentForm.value.amount <= 0) {
    showToast('Amount must be greater than zero.', 'error')
    return
  }
  if (paymentForm.value.amount > item.value.remaining_amount) {
    showToast('Amount exceeds remaining balance.', 'error')
    return
  }

  savingPayment.value = true
  try {
    const paymentData = {
      amount: paymentForm.value.amount,
      payment_date: paymentForm.value.payment_date,
      notes: paymentForm.value.notes,
      [type === 'debtor' ? 'debtor_id' : 'creditor_id']: id
    }
    await financeStore.addPayment(paymentData, type)
    showToast('Payment recorded!', 'success')
    showPaymentModal.value = false
    await fetchData()
  } catch (error) {
    showToast(error.message || 'Failed to record payment.', 'error')
  } finally {
    savingPayment.value = false
  }
}

function confirmDelete() {
  showDeleteModal.value = true
}

async function deleteEntry() {
  deleting.value = true
  try {
    if (type === 'debtor') {
      await financeStore.deleteDebtor(id)
    } else {
      await financeStore.deleteCreditor(id)
    }
    showToast('Deleted successfully!', 'success')
    router.push({ name: 'finance' })
  } catch (error) {
    showToast(error.message || 'Failed to delete.', 'error')
  } finally {
    deleting.value = false
  }
}
</script>
