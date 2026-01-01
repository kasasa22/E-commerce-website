<template>
  <div class="relative">
    <svg :viewBox="`0 0 ${size} ${size}`" class="w-full h-full">
      <g :transform="`translate(${size/2}, ${size/2})`">
        <path
          v-for="(segment, index) in segments"
          :key="index"
          :d="segment.path"
          :fill="segment.color"
          class="cursor-pointer transition-opacity hover:opacity-80"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
        />
      </g>
      <circle
        v-if="donut"
        :cx="size/2"
        :cy="size/2"
        :r="size * 0.25"
        fill="white"
      />
    </svg>
    <div v-if="hoveredIndex !== null" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
      <p class="text-xs font-medium text-gray-600">{{ segments[hoveredIndex]?.label }}</p>
      <p class="text-sm font-bold text-gray-900">{{ formatValue(segments[hoveredIndex]?.value) }}</p>
    </div>
    <div v-if="showLegend" class="mt-4 space-y-2">
      <div v-for="(segment, index) in segments" :key="index" class="flex items-center gap-2 text-sm">
        <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: segment.color }"></span>
        <span class="text-gray-600 truncate">{{ segment.label }}</span>
        <span class="ml-auto font-medium text-gray-900">{{ formatValue(segment.value) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  size: {
    type: Number,
    default: 200
  },
  donut: {
    type: Boolean,
    default: true
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  formatValue: {
    type: Function,
    default: (val) => val.toLocaleString()
  }
})

const hoveredIndex = ref(null)

const colors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

const segments = computed(() => {
  const total = props.data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return []

  let currentAngle = -Math.PI / 2
  const radius = props.size / 2 - 10

  return props.data.map((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    const x1 = Math.cos(startAngle) * radius
    const y1 = Math.sin(startAngle) * radius
    const x2 = Math.cos(endAngle) * radius
    const y2 = Math.sin(endAngle) * radius

    const largeArc = angle > Math.PI ? 1 : 0

    currentAngle = endAngle

    return {
      path: `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: item.color || colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage
    }
  })
})
</script>
