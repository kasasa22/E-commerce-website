<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
      <button
        v-if="userStore.isAdmin"
        @click="showAddModal = true"
        class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Seller
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-500">Loading users...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <p class="text-sm text-red-800">{{ error }}</p>
    </div>

    <div v-else class="bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
      <Table
        :columns="columns"
        :data="paginatedUsers"
      >
        <template #role="{ row }">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            :class="{
              'bg-purple-100 text-purple-800': row.role === 'superadmin',
              'bg-blue-100 text-blue-800': row.role === 'admin',
              'bg-green-100 text-green-800': row.role === 'seller'
            }"
          >
            {{ row.role }}
          </span>
        </template>
        <template #created_at="{ row }">
          {{ new Date(row.created_at).toLocaleDateString() }}
        </template>
      </Table>

      <Pagination
        :current-page="currentPage"
        :total-items="users.length"
        :items-per-page="itemsPerPage"
        @page-change="goToPage"
      />
    </div>

    <!-- Add Seller Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="showAddModal = false"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showAddModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Add New Seller</h3>
              <button
                @click="showAddModal = false"
                class="text-gray-400 hover:text-gray-500"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <SellerForm
              @submit="handleAddSeller"
              @cancel="showAddModal = false"
              :loading="userStore.loading"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '../../stores/userStore'
import Table from '../../components/Table.vue'
import Pagination from '../../components/Pagination.vue'
import SellerForm from '../../components/SellerForm.vue'
import { ITEMS_PER_PAGE } from '../../utils/constants'

const userStore = useUserStore()
const users = ref([])
const loading = ref(false)
const error = ref(null)
const showAddModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ITEMS_PER_PAGE

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return users.value.slice(start, end)
})

function goToPage(page) {
  const totalPages = Math.ceil(users.value.length / itemsPerPage)
  if (page >= 1 && page <= totalPages) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'created_at', label: 'Created' },
]

async function fetchUsers() {
  loading.value = true
  error.value = null
  try {
    const { data, error: fetchError } = await userStore.fetchUsers()
    if (fetchError) throw new Error(fetchError)
    users.value = data || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleAddSeller(sellerData) {
  const { data, error: createError } = await userStore.createSeller(sellerData)
  
  if (createError) {
    error.value = createError
    return
  }

  showAddModal.value = false
  await fetchUsers()
}

onMounted(() => {
  fetchUsers()
})
</script>

