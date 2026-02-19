<template>
  <div>
    <div class="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table class="min-w-full divide-y divide-gray-200" role="table" aria-label="Data table">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-4 lg:px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="(row, index) in data" :key="index" class="hover:bg-blue-50/50 transition-all duration-150">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot :name="column.key" :row="row" :value="row[column.key]">
                <span class="font-medium">{{ formatValue(row[column.key], column) }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden space-y-3">
      <div
        v-for="(row, index) in data"
        :key="index"
        class="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200"
      >
        <div class="space-y-3">
          <div
            v-for="column in columns"
            :key="column.key"
            class="flex justify-between items-start"
          >
            <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {{ column.label }}
            </span>
            <span class="text-sm font-medium text-gray-900 text-right ml-4">
              <slot :name="column.key" :row="row" :value="row[column.key]">
                {{ formatValue(row[column.key], column) }}
              </slot>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getDefaultCurrency } from '../utils/supabase'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
})

function formatValue(value, column) {
  if (value === null || value === undefined) return '-'
  
  if (column.type === 'currency') {
    const currency = getDefaultCurrency()
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'UGX' ? 'UGX' : 'USD',
    }).format(value)
  }
  
  if (column.type === 'date') {
    return new Date(value).toLocaleDateString()
  }
  
  if (column.type === 'datetime') {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  
  return value
}
</script>

