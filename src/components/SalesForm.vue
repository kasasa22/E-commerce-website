<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="product_id" class="block text-sm font-medium text-gray-700">
        Product *
      </label>
      <select
        id="product_id"
        v-model="formData.product_id"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="">Select a product</option>
        <option
          v-for="product in availableProducts"
          :key="product.id"
          :value="product.id"
        >
          {{ product.name }} ({{ product.brand }}) - Stock: {{ product.quantity }}
        </option>
      </select>
    </div>

    <div>
      <label for="quantity" class="block text-sm font-medium text-gray-700">
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
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
      <p v-if="selectedProduct" class="mt-1 text-sm text-gray-500">
        Available: {{ selectedProduct.quantity }} {{ selectedProduct.quantity > 1 ? 'units' : 'unit' }}
      </p>
    </div>

    <div>
      <label for="selling_price" class="block text-sm font-medium text-gray-700">
        Selling Price *
      </label>
      <input
        id="selling_price"
        v-model.number="formData.selling_price"
        type="number"
        min="0"
        step="0.01"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="sold_at" class="block text-sm font-medium text-gray-700">
        Sale Date *
      </label>
      <input
        id="sold_at"
        v-model="formData.sold_at"
        type="datetime-local"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div v-if="selectedProduct && formData.quantity && formData.selling_price" class="p-4 bg-gray-50 rounded-md">
      <p class="text-sm text-gray-700">
        <strong>Estimated Profit:</strong> 
        {{ formatCurrency((formData.selling_price - selectedProduct.buying_price) * formData.quantity) }}
      </p>
    </div>

    <div v-if="error" class="text-red-600 text-sm">
      {{ error }}
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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

