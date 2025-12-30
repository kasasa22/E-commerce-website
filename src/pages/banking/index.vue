<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Banking</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">Track bank deposits and manage accounts.</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          v-if="userStore.isAdmin"
          @click="openBankModal"
          class="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Manage Banks
        </button>
        <button
          @click="openDepositModal"
          class="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Deposit
        </button>
      </div>
    </div>

    <div class="border-b border-gray-200 overflow-x-auto">
      <nav class="-mb-px flex space-x-6 sm:space-x-8 min-w-max">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors'
          ]"
        >
          {{ tab.name }}
          <span
            v-if="tab.count > 0"
            :class="[
              activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900',
              'ml-2 py-0.5 px-2 rounded-full text-xs font-medium inline-block'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <div v-if="activeTab === 'deposits'">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div class="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-green-50 text-green-600">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-2 sm:ml-4 min-w-0 flex-1">
              <p class="text-[10px] sm:text-sm font-medium text-gray-500 truncate">Today</p>
              <p class="text-sm sm:text-xl font-bold text-gray-900 truncate">{{ formatCurrency(store.todayDeposits) }}</p>
            </div>
          </div>
        </div>
        <div v-if="userStore.isAdmin" class="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-600">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-2 sm:ml-4 min-w-0 flex-1">
              <p class="text-[10px] sm:text-sm font-medium text-gray-500 truncate">All Banks</p>
              <p class="text-sm sm:text-xl font-bold text-gray-900 truncate">{{ formatCurrency(store.totalAllBanks) }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100" :class="userStore.isAdmin ? '' : 'col-span-2 sm:col-span-1'">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-purple-50 text-purple-600">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-2 sm:ml-4 min-w-0 flex-1">
              <p class="text-[10px] sm:text-sm font-medium text-gray-500 truncate">Deposits</p>
              <p class="text-sm sm:text-xl font-bold text-gray-900 truncate">{{ store.deposits.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="store.loading" class="p-8 sm:p-12 flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-sm text-gray-500">Loading deposits...</p>
        </div>

        <div v-else-if="store.deposits.length === 0" class="p-8 sm:p-12 text-center">
          <div class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-base sm:text-lg font-medium text-gray-900">No deposits found</h3>
          <p class="text-sm text-gray-500 mt-1">Get started by adding your first deposit.</p>
          <button
            @click="openDepositModal"
            class="mt-4 sm:mt-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Add Deposit
          </button>
        </div>

        <div v-else>
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th v-if="userStore.isAdmin" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="deposit in store.deposits" :key="deposit.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ deposit.banks?.name || 'Unknown' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-semibold text-green-600">{{ formatCurrency(deposit.amount) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ deposit.agent_name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ formatDate(deposit.deposit_date) }}</div>
                  </td>
                  <td v-if="userStore.isAdmin" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="openEditDepositModal(deposit)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button @click="confirmDeleteDeposit(deposit)" class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="md:hidden divide-y divide-gray-200">
            <div v-for="deposit in store.deposits" :key="deposit.id" class="p-4">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1 min-w-0 pr-3">
                  <div class="text-sm font-bold text-gray-900 truncate">{{ deposit.banks?.name || 'Unknown' }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ formatDate(deposit.deposit_date) }}</div>
                </div>
                <p class="text-base font-bold text-green-600 flex-shrink-0">{{ formatCurrency(deposit.amount) }}</p>
              </div>
              <div class="text-xs text-gray-600 mb-3">
                <span class="font-medium">Agent:</span> {{ deposit.agent_name }}
              </div>
              <div v-if="userStore.isAdmin" class="flex gap-2">
                <button @click="openEditDepositModal(deposit)" class="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium">Edit</button>
                <button @click="confirmDeleteDeposit(deposit)" class="flex-1 px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'banks' && userStore.isAdmin">
      <div v-if="Object.keys(store.depositsByBank).length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div v-for="(bankData, bankId) in store.depositsByBank" :key="bankId" class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">{{ bankData.bank?.name || 'Unknown' }}</h3>
            <span class="text-xs text-gray-500 flex-shrink-0">{{ bankData.count }} deposits</span>
          </div>
          <p class="text-xl sm:text-2xl font-bold text-green-600">{{ formatCurrency(bankData.total) }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 class="font-semibold text-gray-900">All Banks</h3>
          <button
            @click="openAddBankModal"
            class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 w-full sm:w-auto"
          >
            Add Bank
          </button>
        </div>

        <div v-if="store.banks.length === 0" class="p-8 text-center">
          <p class="text-gray-500">No banks added yet.</p>
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div v-for="bank in store.banks" :key="bank.id" class="p-4">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-medium text-gray-900 text-sm sm:text-base">{{ bank.name }}</h4>
                  <span v-if="!bank.is_active" class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Inactive</span>
                </div>
                <p class="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{{ bank.account_number || 'No account number' }} {{ bank.branch ? `- ${bank.branch}` : '' }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="openEditBankModal(bank)" class="flex-1 sm:flex-initial px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium">Edit</button>
                <button @click="confirmDeleteBank(bank)" class="flex-1 sm:flex-initial px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDepositModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="showDepositModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-5">
              {{ isEditingDeposit ? 'Edit Deposit' : 'Add New Deposit' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                <select
                  v-model="depositForm.bank_id"
                  class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5"
                >
                  <option value="">Select a bank</option>
                  <option v-for="bank in store.activeBanks" :key="bank.id" :value="bank.id">{{ bank.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div class="relative rounded-lg shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 text-base">{{ currencySymbol }}</span>
                  </div>
                  <input v-model.number="depositForm.amount" type="number" class="block w-full pl-14 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" placeholder="0" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input v-model="depositForm.agent_name" type="text" class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" placeholder="Person who deposited" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input v-model="depositForm.deposit_date" type="date" class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" />
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button @click="showDepositModal = false" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button @click="saveDeposit" :disabled="saving" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <span v-if="saving" class="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isEditingDeposit ? 'Update' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showBankModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end sm:items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="showBankModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-bold text-gray-900 mb-5">
              {{ isEditingBank ? 'Edit Bank' : 'Add New Bank' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input v-model="bankForm.name" type="text" class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" placeholder="Enter bank name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Account Number (Optional)</label>
                <input v-model="bankForm.account_number" type="text" class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" placeholder="Account number" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Branch (Optional)</label>
                <input v-model="bankForm.branch" type="text" class="block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2.5" placeholder="Branch name" />
              </div>
              <div class="flex items-center">
                <input v-model="bankForm.is_active" type="checkbox" id="is_active" class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label for="is_active" class="ml-3 block text-sm text-gray-900">Active</label>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button @click="showBankModal = false" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button @click="saveBank" :disabled="saving" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <span v-if="saving" class="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isEditingBank ? 'Update' : 'Save' }}
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
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete {{ deleteType === 'deposit' ? 'Deposit' : 'Bank' }}</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Are you sure you want to delete this {{ deleteType }}? This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button @click="showDeleteModal = false" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button @click="executeDelete" :disabled="deleting" class="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
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
import { getDefaultCurrency } from '../../utils/supabase'

const store = useExpensesBankingStore()
const userStore = useUserStore()
const { showToast } = useToast()

const activeTab = ref('deposits')
const tabs = computed(() => {
  const baseTabs = [{ id: 'deposits', name: 'Deposits', count: store.deposits.length }]
  if (userStore.isAdmin) {
    baseTabs.push({ id: 'banks', name: 'Banks', count: store.banks.length })
  }
  return baseTabs
})

const showDepositModal = ref(false)
const showBankModal = ref(false)
const showDeleteModal = ref(false)
const isEditingDeposit = ref(false)
const isEditingBank = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deleteType = ref('')
const itemToDelete = ref(null)

const depositForm = ref({
  id: null,
  bank_id: '',
  amount: 0,
  agent_name: '',
  deposit_date: new Date().toISOString().split('T')[0]
})

const bankForm = ref({
  id: null,
  name: '',
  account_number: '',
  branch: '',
  is_active: true
})

const currencySymbol = computed(() => {
  const currency = getDefaultCurrency()
  return currency === 'UGX' ? 'UGX' : '$'
})

onMounted(async () => {
  await Promise.all([
    store.fetchBanks(),
    store.fetchDeposits()
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

function openDepositModal() {
  isEditingDeposit.value = false
  depositForm.value = {
    id: null,
    bank_id: '',
    amount: 0,
    agent_name: '',
    deposit_date: new Date().toISOString().split('T')[0]
  }
  showDepositModal.value = true
}

function openEditDepositModal(deposit) {
  isEditingDeposit.value = true
  depositForm.value = {
    id: deposit.id,
    bank_id: deposit.bank_id,
    bank_name: deposit.banks?.name || '',
    amount: deposit.amount,
    agent_name: deposit.agent_name,
    deposit_date: deposit.deposit_date
  }
  showDepositModal.value = true
}

function openBankModal() {
  activeTab.value = 'banks'
}

function openAddBankModal() {
  isEditingBank.value = false
  bankForm.value = {
    id: null,
    name: '',
    account_number: '',
    branch: '',
    is_active: true
  }
  showBankModal.value = true
}

function openEditBankModal(bank) {
  isEditingBank.value = true
  bankForm.value = {
    id: bank.id,
    name: bank.name,
    account_number: bank.account_number || '',
    branch: bank.branch || '',
    is_active: bank.is_active
  }
  showBankModal.value = true
}

function confirmDeleteDeposit(deposit) {
  deleteType.value = 'deposit'
  itemToDelete.value = deposit
  showDeleteModal.value = true
}

function confirmDeleteBank(bank) {
  deleteType.value = 'bank'
  itemToDelete.value = bank
  showDeleteModal.value = true
}

async function saveDeposit() {
  if (!depositForm.value.bank_id || depositForm.value.amount <= 0 || !depositForm.value.agent_name) {
    showToast('Please fill in all required fields.', 'error')
    return
  }

  saving.value = true
  try {
    const data = {
      bank_id: depositForm.value.bank_id,
      amount: depositForm.value.amount,
      agent_name: depositForm.value.agent_name,
      deposit_date: depositForm.value.deposit_date
    }

    if (isEditingDeposit.value) {
      await store.updateDeposit(depositForm.value.id, data)
      showToast('Deposit updated successfully!', 'success')
    } else {
      await store.addDeposit(data)
      showToast('Deposit added successfully!', 'success')
    }
    showDepositModal.value = false
  } catch (error) {
    showToast(error.message || 'An error occurred.', 'error')
  } finally {
    saving.value = false
  }
}

async function saveBank() {
  if (!bankForm.value.name) {
    showToast('Please enter a bank name.', 'error')
    return
  }

  saving.value = true
  try {
    const data = {
      name: bankForm.value.name,
      account_number: bankForm.value.account_number || null,
      branch: bankForm.value.branch || null,
      is_active: bankForm.value.is_active
    }

    if (isEditingBank.value) {
      await store.updateBank(bankForm.value.id, data)
      showToast('Bank updated successfully!', 'success')
    } else {
      await store.addBank(data)
      showToast('Bank added successfully!', 'success')
    }
    showBankModal.value = false
  } catch (error) {
    showToast(error.message || 'An error occurred.', 'error')
  } finally {
    saving.value = false
  }
}

async function executeDelete() {
  if (!itemToDelete.value) return

  deleting.value = true
  try {
    if (deleteType.value === 'deposit') {
      await store.deleteDeposit(itemToDelete.value.id)
      showToast('Deposit deleted successfully!', 'success')
    } else {
      await store.deleteBank(itemToDelete.value.id)
      showToast('Bank deleted successfully!', 'success')
    }
    showDeleteModal.value = false
    itemToDelete.value = null
  } catch (error) {
    showToast(error.message || 'An error occurred.', 'error')
  } finally {
    deleting.value = false
  }
}
</script>
