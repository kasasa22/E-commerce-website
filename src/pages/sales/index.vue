<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Sales</h1>
      <router-link
        to="/sales/create"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        New Sale
      </router-link>
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

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <Table
        :columns="columns"
        :data="salesStore.sales"
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
</template>

<script setup>
import { onMounted } from 'vue'
import { useSalesStore } from '../../stores/salesStore'
import Table from '../../components/Table.vue'
import { getDefaultCurrency } from '../../utils/supabase'

const salesStore = useSalesStore()
const currency = getDefaultCurrency()

const columns = [
  { key: 'product_name', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'selling_price', label: 'Selling Price', type: 'currency' },
  { key: 'profit', label: 'Profit/Loss' },
  { key: 'sold_at', label: 'Date', type: 'datetime' },
]

onMounted(() => {
  salesStore.fetchSales()
})

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value)
}
</script>

