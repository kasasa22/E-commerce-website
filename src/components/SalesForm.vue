<template>
  <form @submit.prevent="handleSubmit" class="space-y-3 sm:space-y-4">
    <div>
      <label for="product_id" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Product *
      </label>
      <select
        id="product_id"
        v-model="formData.product_id"
        required
        class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
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
      <label for="quantity" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Quantity *
      </label>
      <input
        id="quantity"
        v-model.number="formData.quantity"
        type="number"
        min="0.01"
        step="0.01"
        required
        :max="maxQuantity"
        class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
      />
      <p v-if="selectedProduct" class="mt-1 text-xs text-gray-500">
        Available: {{ maxQuantity }} {{ maxQuantity > 1 ? 'units' : 'unit' }}
      </p>
    </div>

    <div>
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
        class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
      />
    </div>

    <div>
      <label for="sold_at" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Sale Date *
      </label>
      <input
        id="sold_at"
        v-model="formData.sold_at"
        type="datetime-local"
        required
        class="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
      />
    </div>

    <div v-if="selectedProduct && formData.quantity && formData.selling_price" class="p-3 bg-gray-50 rounded-md border border-gray-200">
      <p class="text-xs sm:text-sm text-gray-700">
        <strong>Estimated Profit:</strong>
        {{ formatCurrency((formData.selling_price - selectedProduct.buying_price) * formData.quantity) }}
      </p>
    </div>

    <div v-if="error" class="text-red-600 text-xs sm:text-sm">
      {{ error }}
    </div>

    <div class="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ loading ? 'Saving...' : 'Save Sale' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProductStore } from '../stores/productStore'
import { formatCurrency } from '../utils/formatters'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  initialData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const productStore = useProductStore()

function getCurrentLocalDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formData = ref({
  product_id: '',
  quantity: 0,
  selling_price: 0,
  sold_at: getCurrentLocalDateTime(),
})

// Initialize form data when initialData changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      product_id: newData.product_id,
      quantity: newData.quantity,
      selling_price: newData.selling_price,
      sold_at: new Date(newData.sold_at).toISOString().slice(0, 16),
    }
  } else {
    formData.value = {
      product_id: '',
      quantity: 0,
      selling_price: 0,
      sold_at: getCurrentLocalDateTime(),
    }
  }
}, { immediate: true })

const availableProducts = computed(() => {
  return productStore.products.filter(p => {
    // Show product if it has stock OR if it's the product currently being edited
    return p.quantity > 0 || (props.initialData && p.id === props.initialData.product_id)
  })
})

const selectedProduct = computed(() => {
  if (!formData.value.product_id) return null
  return productStore.products.find(p => p.id === formData.value.product_id)
})

const maxQuantity = computed(() => {
  if (!selectedProduct.value) return 0
  
  let available = selectedProduct.value.quantity
  
  // If we are editing and the selected product is the same as the original sale's product,
  // add the original quantity back to the available amount
  if (props.initialData && props.initialData.product_id === selectedProduct.value.id) {
    available += props.initialData.quantity
  }
  
  return available
})

function handleSubmit() {
  emit('submit', {
    ...formData.value,
    sold_at: new Date(formData.value.sold_at).toISOString(),
  })
}
</script>

