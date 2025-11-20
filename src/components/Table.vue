<template>
  <div>
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(row, index) in data" :key="index" class="hover:bg-gray-50">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot :name="column.key" :row="row" :value="row[column.key]">
                {{ formatValue(row[column.key], column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="md:hidden space-y-4">
      <div
        v-for="(row, index) in data"
        :key="index"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
      >
        <div class="space-y-3">
          <div
            v-for="column in columns"
            :key="column.key"
            class="flex justify-between items-start"
          >
            <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">
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
    return new Date(value).toLocaleString()
  }
  
  return value
}
</script>

