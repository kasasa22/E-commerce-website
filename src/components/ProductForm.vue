<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5 md:space-y-6">
    <div>
      <label for="name" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Product Name *
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2.5"
      />
    </div>

    <div>
      <label for="quantity" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Quantity *
      </label>
      <input
        id="quantity"
        v-model.number="formData.quantity"
        type="number"
        min="0"
        step="0.01"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2.5"
      />
    </div>

    <div>
      <label for="buying_price" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Buying Price *
      </label>
      <input
        id="buying_price"
        v-model.number="formData.buying_price"
        type="number"
        min="0"
        step="0.01"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2.5"
      />
    </div>

    <div v-if="product">
      <label for="selling_price" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Selling Price *
      </label>
      <input
        id="selling_price"
        v-model.number="formData.selling_price"
        type="number"
        min="0"
        step="0.01"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2.5"
      />
    </div>

    <div v-if="error" class="text-red-600 text-sm">
      {{ error }}
    </div>

    <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="w-full sm:w-auto px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {{ loading ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  name: '',
  quantity: 0,
  buying_price: 0,
  selling_price: 0,
})

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.value = {
      name: newProduct.name,
      quantity: newProduct.quantity,
      buying_price: newProduct.buying_price,
      selling_price: newProduct.selling_price,
    }
  } else {
    formData.value = {
      name: '',
      quantity: 0,
      buying_price: 0,
      selling_price: 0,
    }
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', formData.value)
}
</script>

