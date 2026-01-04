<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Expenses</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">Track and manage business expenses.</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Expense
      </button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <div class="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center">
          <div class="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-red-50 text-red-600">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-2 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-700 truncate">Today</p>
            <p class="text-sm sm:text-xl font-bold text-gray-900 truncate">{{ formatCurrency(store.todayExpenses) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center">
          <div class="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-orange-50 text-orange-600">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-2 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-700 truncate">Total</p>
            <p class="text-sm sm:text-xl font-bold text-gray-900 truncate">{{ formatCurrency(store.totalExpenses) }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100 col-span-2 sm:col-span-1">
        <div class="flex items-center">
          <div class="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-600">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-2 sm:ml-4 min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-medium text-gray-700 truncate">Records</p>
            <p class="text-sm sm:text-xl font-bold text-gray-900 truncate">{{ store.expenses.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search expenses..."
        class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
      />
      <svg class="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="store.loading" class="p-8 sm:p-12 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-sm text-gray-600">Loading expenses...</p>
      </div>

      <div v-else-if="filteredExpenses.length === 0" class="p-8 sm:p-12 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
          <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-base sm:text-lg font-medium text-gray-900">No expenses found</h3>
        <p class="text-sm text-gray-600 mt-1">Get started by adding your first expense.</p>
        <button
          @click="openAddModal"
          class="mt-4 sm:mt-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Add Expense
        </button>
      </div>

      <div v-else>
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th v-if="userStore.isAdmin" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="expense in filteredExpenses" :key="expense.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ expense.title }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-semibold text-red-600">{{ formatCurrency(expense.amount) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(expense.expense_date) }}</div>
                </td>
                <td v-if="userStore.isAdmin" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openEditModal(expense)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button @click="confirmDelete(expense)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden divide-y divide-gray-200">
          <div v-for="expense in filteredExpenses" :key="expense.id" class="p-4">
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1 min-w-0 pr-3">
                <div class="text-sm font-bold text-gray-900 truncate">{{ expense.title }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ formatDate(expense.expense_date) }}</div>
              </div>
              <p class="text-base font-bold text-red-600 flex-shrink-0">{{ formatCurrency(expense.amount) }}</p>
            </div>
            <div v-if="userStore.isAdmin" class="flex gap-2 mt-3">
              <button @click="openEditModal(expense)" class="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium">Edit</button>
              <button @click="confirmDelete(expense)" class="flex-1 px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-5">
              {{ isEditing ? 'Edit Expense' : 'Add New Expense' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input v-model="form.title" type="text" class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" placeholder="Enter expense title" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div class="relative rounded-lg shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-base">{{ currencySymbol }}</span>
                  </div>
                  <input v-model.number="form.amount" type="number" class="block w-full pl-14 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" placeholder="0" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input v-model="form.expense_date" type="date" class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" />
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button @click="closeModal" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button @click="saveExpense" :disabled="saving" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <span v-if="saving" class="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isEditing ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Expense</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Are you sure you want to delete "{{ expenseToDelete?.title }}"? This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button @click="showDeleteModal = false" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button @click="deleteExpense" :disabled="deleting" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
              <span v-if="deleting" class="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpensesBankingStore } from '../../stores/expensesBankingStore'
import { useUserStore } from '../../stores/userStore'
import { useToast } from '../../composables/useToast'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { getDefaultCurrency } from '../../utils/supabase'

const store = useExpensesBankingStore()
const userStore = useUserStore()
const { showToast } = useToast()

const searchQuery = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const expenseToDelete = ref(null)

const form = ref({
  id: null,
  title: '',
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0]
})

const currencySymbol = computed(() => {
  const currency = getDefaultCurrency()
  return currency === 'UGX' ? 'UGX' : '$'
})

const filteredExpenses = computed(() => {
  let result = store.expenses
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(e => e.title.toLowerCase().includes(query))
  }
  return result
})

onMounted(async () => {
  await store.fetchExpenses()
})

function openAddModal() {
  isEditing.value = false
  form.value = {
    id: null,
    title: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0]
  }
  showModal.value = true
}

function openEditModal(expense) {
  isEditing.value = true
  form.value = {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    expense_date: expense.expense_date
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function confirmDelete(expense) {
  expenseToDelete.value = expense
  showDeleteModal.value = true
}

async function saveExpense() {
  if (!form.value.title || form.value.amount <= 0) {
    showToast('Please fill in all required fields.', 'error')
    return
  }

  saving.value = true
  try {
    const expenseData = {
      title: form.value.title,
      amount: form.value.amount,
      expense_date: form.value.expense_date
    }

    if (isEditing.value) {
      await store.updateExpense(form.value.id, expenseData)
      showToast('Expense updated successfully!', 'success')
    } else {
      await store.addExpense(expenseData)
      showToast('Expense added successfully!', 'success')
    }
    closeModal()
  } catch (error) {
    showToast(error.message || 'An error occurred.', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteExpense() {
  if (!expenseToDelete.value) return

  deleting.value = true
  try {
    await store.deleteExpense(expenseToDelete.value.id)
    showToast('Expense deleted successfully!', 'success')
    showDeleteModal.value = false
    expenseToDelete.value = null
  } catch (error) {
    showToast(error.message || 'An error occurred.', 'error')
  } finally {
    deleting.value = false
  }
}
</script>
