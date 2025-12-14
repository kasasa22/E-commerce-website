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

    <div v-if="!salesStore.loading && salesStore.sales.length > 0" class="mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search sales by product name or date..."
          class="block w-full sm:w-80 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2 pl-10"
        />
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="salesStore.loading" class="text-center py-8">
      <p class="text-gray-500">Loading sales...</p>
    </div>

    <div v-else-if="salesStore.error" class="text-red-600 py-4">
      {{ salesStore.error }}
    </div>

    <div v-else-if="salesStore.sales.length === 0" class="text-center py-8">
      <p class="text-gray-500">No sales found. Create your first sale!</p>
    </div>

    <div v-else-if="filteredSales.length === 0" class="text-center py-8">
      <p class="text-gray-500">No sales match your search.</p>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="hidden md:block">
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

      <div class="md:hidden p-4 space-y-4">
        <div
          v-for="sale in filteredSales"
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
                  {{ new Date(sale.sold_at).toLocaleString() }}
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
              <div>
                <p class="text-xs text-gray-500">Profit/Loss</p>
                <p class="text-sm font-medium" :class="sale.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(sale.profit) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div class="relative bg-white rounded-lg shadow-xl border-2 border-gray-200 w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl my-4 md:my-0 max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div class="p-4 sm:p-5 md:p-8 lg:p-7">
          <div class="flex justify-between items-center mb-4 sm:mb-5 md:mb-8">
            <h3 class="text-base sm:text-lg md:text-2xl font-medium text-gray-900">New Sale</h3>
            <button
              @click="showCreateModal = false"
              class="text-gray-400 hover:text-gray-500 transition-colors p-1 md:p-2 rounded-full hover:bg-gray-100"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SalesForm
            :loading="salesStore.loading"
            :error="salesStore.error"
            @submit="handleCreate"
            @cancel="showCreateModal = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useSalesStore } from '../../stores/salesStore'
import { useProductStore } from '../../stores/productStore'
import Table from '../../components/Table.vue'
import SalesForm from '../../components/SalesForm.vue'
import { getDefaultCurrency } from '../../utils/supabase'

const salesStore = useSalesStore()
const productStore = useProductStore()
const currency = getDefaultCurrency()
const showCreateModal = ref(false)
const searchQuery = ref('')

const filteredSales = computed(() => {
  if (!searchQuery.value.trim()) {
    return salesStore.sales
  }
  const query = searchQuery.value.toLowerCase().trim()
  return salesStore.sales.filter(sale => {
    const productName = sale.products?.name?.toLowerCase() || ''
    const saleDate = new Date(sale.sold_at).toLocaleString().toLowerCase()
    const quantity = sale.quantity.toString()
    const price = sale.selling_price.toString()
    return productName.includes(query) ||
           saleDate.includes(query) ||
           quantity.includes(query) ||
           price.includes(query)
  })
})

const columns = [
  { key: 'product_name', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'selling_price', label: 'Selling Price', type: 'currency' },
  { key: 'profit', label: 'Profit/Loss' },
  { key: 'sold_at', label: 'Date', type: 'datetime' },
]

onMounted(() => {
  salesStore.fetchSales()
  productStore.fetchProducts()
})

async function handleCreate(saleData) {
  const { error } = await salesStore.createSale(saleData)
  if (!error) {
    showCreateModal.value = false
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value)
}
</script>

