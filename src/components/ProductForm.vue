<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">
        Product Name *
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="brand" class="block text-sm font-medium text-gray-700">
        Brand *
      </label>
      <input
        id="brand"
        v-model="formData.brand"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="type" class="block text-sm font-medium text-gray-700">
        Type *
      </label>
      <input
        id="type"
        v-model="formData.type"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="category" class="block text-sm font-medium text-gray-700">
        Category *
      </label>
      <input
        id="category"
        v-model="formData.category"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="quantity" class="block text-sm font-medium text-gray-700">
        Quantity *
      </label>
      <input
        id="quantity"
        v-model.number="formData.quantity"
        type="number"
        min="0"
        step="0.01"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="buying_price" class="block text-sm font-medium text-gray-700">
        Buying Price *
      </label>
      <input
        id="buying_price"
        v-model.number="formData.buying_price"
        type="number"
        min="0"
        step="0.01"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
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
  brand: '',
  type: '',
  category: '',
  quantity: 0,
  buying_price: 0,
  selling_price: 0,
})

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.value = { ...newProduct }
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', formData.value)
}
</script>

