<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Sales</h1>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        New Sale
      </button>
    </div>

    <div v-if="!salesStore.loading && salesStore.sales.length > 0" class="mb-4 flex flex-col md:flex-row gap-4">
      <div class="relative flex-grow md:flex-grow-0 md:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search sales by product name..."
          class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2 pl-10"
        />
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div class="flex items-center gap-2">
          <label for="dateFilter" class="text-sm text-gray-600 whitespace-nowrap">Filter by Date:</label>
          <input
            id="dateFilter"
            v-model="dateFilter"
            type="date"
            class="block w-full sm:w-auto rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
          />
        </div>
        <button 
          v-if="dateFilter"
          @click="clearDateFilter"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
        >
          Clear Date
        </button>
      </div>
    </div>

    <div v-if="salesStore.loading" class="flex flex-col items-center justify-center py-8 sm:py-12">
      <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-sm text-gray-600">Loading sales...</p>
    </div>

    <div v-else-if="salesStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <p class="text-red-700">{{ salesStore.error }}</p>
        <button @click="salesStore.fetchSales()" class="text-sm font-medium text-red-600 hover:text-red-800">
          Retry
        </button>
      </div>
    </div>

    <EmptyState
      v-else-if="salesStore.sales.length === 0"
      title="No sales found"
      description="Get started by creating your first sale."
      action-text="New Sale"
      @action="showCreateModal = true"
    />

    <EmptyState
      v-else-if="filteredSales.length === 0"
      title="No sales match your search"
      description="Try adjusting your search terms or date filter."
    />

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="hidden md:block">
        <Table
          :columns="columns"
          :data="paginatedSales"
        >
          <template #product_name="{ row }">
            {{ row.products?.name || '-' }}
          </template>
          <template #total="{ row }">
            {{ formatCurrency(row.quantity * row.selling_price) }}
          </template>
          <template v-if="userStore.isAdmin" #profit="{ row }">
            <span :class="row.profit >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ formatCurrency(row.profit) }}
            </span>
          </template>
          <template v-if="userStore.isAdmin" #actions="{ row }">
            <button
              @click="handleEdit(row)"
              class="text-blue-600 hover:text-blue-900 font-medium"
            >
              Edit
            </button>
          </template>
        </Table>
      </div>

      <div class="md:hidden p-4 space-y-4">
        <div
          v-for="sale in paginatedSales"
          :key="sale.id"
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div class="space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-base font-semibold text-gray-900">
                  {{ sale.products?.name || 'Unknown Product' }}
                </h3>
                <p class="text-xs text-gray-500 mt-1">
                  {{ new Date(sale.sold_at).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <p class="text-xs text-gray-500">Quantity</p>
                <p class="text-sm font-medium text-gray-900">{{ sale.quantity }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Selling Price</p>
                <p class="text-sm font-medium text-gray-900">{{ formatCurrency(sale.selling_price) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Total Amount</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(sale.selling_price * sale.quantity) }}
                </p>
              </div>
              <div v-if="userStore.isAdmin">
                <p class="text-xs text-gray-500">Profit/Loss</p>
                <p class="text-sm font-medium" :class="sale.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(sale.profit) }}
                </p>
              </div>
            </div>
            
            <div v-if="userStore.isAdmin" class="pt-3 border-t border-gray-100 flex justify-end">
              <button
                @click="handleEdit(sale)"
                class="text-sm font-medium text-blue-600 hover:text-blue-900"
              >
                Edit Sale
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Pagination
        :current-page="currentPage"
        :total-items="filteredSales.length"
        :items-per-page="itemsPerPage"
        @page-change="goToPage"
      />
    </div>

    <ModalWrapper v-model="showCreateModal" title="New Sale">
      <SalesForm
        :loading="salesStore.loading"
        :error="salesStore.error"
        @submit="handleCreate"
        @cancel="showCreateModal = false"
      />
    </ModalWrapper>

    <ModalWrapper v-model="showEditModal" title="Edit Sale">
      <SalesForm
        :loading="salesStore.loading"
        :error="salesStore.error"
        :initial-data="selectedSale"
        @submit="handleUpdate"
        @cancel="showEditModal = false"
      />
    </ModalWrapper>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useSalesStore } from '../../stores/salesStore'
import { useProductStore } from '../../stores/productStore'
import { useUserStore } from '../../stores/userStore'
import Table from '../../components/Table.vue'
import SalesForm from '../../components/SalesForm.vue'
import Pagination from '../../components/Pagination.vue'
import EmptyState from '../../components/EmptyState.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import { formatCurrency } from '../../utils/formatters'
import { ITEMS_PER_PAGE } from '../../utils/constants'

const salesStore = useSalesStore()
const productStore = useProductStore()
const userStore = useUserStore()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedSale = ref(null)
const searchQuery = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ITEMS_PER_PAGE

const filteredSales = computed(() => {
  let sales = salesStore.sales
  
  // Date Filter
  // Date Filter
  if (dateFilter.value) {
    const filterDate = dateFilter.value
    sales = sales.filter(s => {
      const saleDate = new Date(s.sold_at).toISOString().split('T')[0]
      return saleDate === filterDate
    })
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    sales = sales.filter(sale => {
      const productName = sale.products?.name?.toLowerCase() || ''
      const quantity = sale.quantity.toString()
      const price = sale.selling_price.toString()
      return productName.includes(query) ||
             quantity.includes(query) ||
             price.includes(query)
    })
  }
  
  return sales
})



function clearDateFilter() {
  dateFilter.value = ''
}

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSales.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredSales.value.length / itemsPerPage))

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset to page 1 when filters change
watch([searchQuery, dateFilter], () => {
  currentPage.value = 1
})

const columns = computed(() => {
  const baseColumns = [
    { key: 'product_name', label: 'Product' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'selling_price', label: 'Selling Price', type: 'currency' },
    { key: 'total', label: 'Total', type: 'currency' },
  ]
  
  // Only show profit column for admins
  if (userStore.isAdmin) {
    baseColumns.push({ key: 'profit', label: 'Profit/Loss' })
    baseColumns.push({ key: 'actions', label: 'Actions' })
  }
  
  baseColumns.push({ key: 'sold_at', label: 'Date', type: 'datetime' })
  
  return baseColumns
})

onMounted(() => {
  salesStore.fetchSales()
  productStore.fetchProducts()
})

async function handleCreate(saleData) {
  const { error } = await salesStore.createSale(saleData)
  if (!error) {
    showCreateModal.value = false
    await productStore.fetchProducts()
  }
}

function handleEdit(sale) {
  selectedSale.value = sale
  showEditModal.value = true
}

async function handleUpdate(saleData) {
  if (!selectedSale.value) return
  
  const { error } = await salesStore.updateSale(selectedSale.value.id, saleData)
  if (!error) {
    showEditModal.value = false
    selectedSale.value = null
    await productStore.fetchProducts()
  }
}

</script>

