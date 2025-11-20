<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="(row, index) in data" :key="index">
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
          >
            <slot :name="column.key" :row="row" :value="row[column.key]">
              {{ formatValue(row[column.key], column) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
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

