<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9999] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity"
          aria-hidden="true"
          @click="handleBackdropClick"
        ></div>

        <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <div
          class="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:align-middle border-2 border-gray-200"
          :class="sizeClass"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div class="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h3
                :id="titleId"
                class="text-base sm:text-lg md:text-xl font-medium text-gray-900"
              >
                {{ title }}
              </h3>
              <button
                type="button"
                @click="close"
                class="text-gray-400 hover:text-gray-500 transition-colors p-1 md:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close modal"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="max-h-[70vh] overflow-y-auto">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-[90%] max-w-xs sm:max-w-sm',
    md: 'w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg',
    lg: 'w-[90%] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl',
    xl: 'w-[90%] max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl'
  }
  return sizes[props.size]
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

watch(() => props.modelValue, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
