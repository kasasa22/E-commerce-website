<template>
  <div class="flex flex-col items-center justify-center" :class="containerClass">
    <div
      class="animate-spin rounded-full border-b-2"
      :class="[sizeClass, colorClass]"
    ></div>
    <p v-if="text" class="mt-4 text-sm text-gray-600">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  color: {
    type: String,
    default: 'blue'
  },
  text: {
    type: String,
    default: ''
  },
  fullHeight: {
    type: Boolean,
    default: false
  }
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10 sm:h-12 sm:w-12',
    lg: 'h-16 w-16'
  }
  return sizes[props.size]
})

const colorClass = computed(() => {
  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    gray: 'border-gray-600'
  }
  return colors[props.color] || colors.blue
})

const containerClass = computed(() => {
  return props.fullHeight ? 'min-h-[200px] py-8 sm:py-12' : 'py-8 sm:py-12'
})
</script>
