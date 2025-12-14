<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5 md:space-y-7">
    <div>
      <label for="product_id" class="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
        Product *
      </label>
      <select
        id="product_id"
        v-model="formData.product_id"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base md:text-lg px-3 md:px-4 py-2.5 md:py-3.5"
      >
        <option value="">Select a product</option>
        <option
          v-for="product in availableProducts"
          :key="product.id"
          :value="product.id"
        >
          {{ product.name }} - Stock: {{ product.quantity }}
        </option>
      </select>
    </div>

    <div>
      <label for="quantity" class="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
        Quantity *
      </label>
      <input
        id="quantity"
        v-model.number="formData.quantity"
        type="number"
        min="0.01"
        step="0.01"
        required
        :max="selectedProduct?.quantity || 0"
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base md:text-lg px-3 md:px-4 py-2.5 md:py-3.5"
      />
      <p v-if="selectedProduct" class="mt-1.5 md:mt-2 text-xs sm:text-sm md:text-base text-gray-500">
        Available: {{ selectedProduct.quantity }} {{ selectedProduct.quantity > 1 ? 'units' : 'unit' }}
      </p>
    </div>

    <div>
      <label for="selling_price" class="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
        Selling Price *
      </label>
      <input
        id="selling_price"
        v-model.number="formData.selling_price"
        type="number"
        min="0"
        step="0.01"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base md:text-lg px-3 md:px-4 py-2.5 md:py-3.5"
      />
    </div>

    <div>
      <label for="sold_at" class="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2">
        Sale Date *
      </label>
      <input
        id="sold_at"
        v-model="formData.sold_at"
        type="datetime-local"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base md:text-lg px-3 md:px-4 py-2.5 md:py-3.5"
      />
    </div>

    <div v-if="selectedProduct && formData.quantity && formData.selling_price" class="p-3 sm:p-4 md:p-5 bg-gray-50 rounded-md border-2 border-gray-200">
      <p class="text-xs sm:text-sm md:text-base text-gray-700">
        <strong>Estimated Profit:</strong>
        {{ formatCurrency((formData.selling_price - selectedProduct.buying_price) * formData.quantity) }}
      </p>
    </div>

    <div v-if="error" class="text-red-600 text-xs sm:text-sm md:text-base">
      {{ error }}
    </div>

    <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-4 md:pt-6">
      <button
        type="button"
        @click="$emit('cancel')"
        class="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 md:py-3 border border-gray-300 rounded-md shadow-sm text-sm md:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 md:py-3 border border-transparent rounded-md shadow-sm text-sm md:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {{ loading ? 'Saving...' : 'Save Sale' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProductStore } from '../stores/productStore'
import { getDefaultCurrency } from '../utils/supabase'

const props = defineProps({
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

const productStore = useProductStore()

const formData = ref({
  product_id: '',
  quantity: 0,
  selling_price: 0,
  sold_at: new Date().toISOString().slice(0, 16),
})

const availableProducts = computed(() => {
  return productStore.products.filter(p => p.quantity > 0)
})

const selectedProduct = computed(() => {
  if (!formData.value.product_id) return null
  return productStore.products.find(p => p.id === formData.value.product_id)
})

function formatCurrency(value) {
  const currency = getDefaultCurrency()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value)
}

function handleSubmit() {
  emit('submit', {
    ...formData.value,
    sold_at: new Date(formData.value.sold_at).toISOString(),
  })
}
</script>

