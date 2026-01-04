<template>
  <div class="text-center py-8 sm:py-12">
    <div
      class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-4"
      :class="iconBgClass"
    >
      <slot name="icon">
        <svg class="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </slot>
    </div>
    <h3 class="text-base sm:text-lg font-medium text-gray-900">{{ title }}</h3>
    <p class="text-sm text-gray-600 mt-1">{{ description }}</p>
    <div v-if="$slots.action || actionText" class="mt-4 sm:mt-6">
      <slot name="action">
        <button
          v-if="actionText"
          @click="$emit('action')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'No data found'
  },
  description: {
    type: String,
    default: 'Get started by creating your first item.'
  },
  actionText: {
    type: String,
    default: ''
  },
  iconBg: {
    type: String,
    default: 'gray'
  }
})

defineEmits(['action'])

const iconBgClass = computed(() => {
  const colors = {
    gray: 'bg-gray-100 text-gray-400',
    blue: 'bg-blue-100 text-blue-400',
    green: 'bg-green-100 text-green-400',
    red: 'bg-red-100 text-red-400'
  }
  return colors[props.iconBg] || colors.gray
})
</script>
