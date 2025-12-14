<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Products</h1>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Add Product
      </button>
    </div>

    <div v-if="!productStore.loading && productStore.products.length > 0" class="mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products by name..."
          class="block w-full sm:w-80 rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2 pl-10"
        />
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="productStore.loading" class="text-center py-8">
      <p class="text-gray-500">Loading products...</p>
    </div>

    <div v-else-if="productStore.error" class="text-red-600 py-4">
      {{ productStore.error }}
    </div>

    <div v-else-if="productStore.products.length === 0" class="text-center py-8">
      <p class="text-gray-500">No products found. Create your first product!</p>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="text-center py-8">
      <p class="text-gray-500">No products match your search.</p>
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="hidden md:block">
      <Table
        :columns="columns"
          :data="filteredProducts"
      >
        <template #actions="{ row }">
          <div class="flex space-x-2">
            <button
              v-if="userStore.isAdmin"
              @click="handleEdit(row)"
                class="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Edit
            </button>
            <button
              v-if="userStore.isAdmin"
              @click="handleDelete(row.id)"
                class="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </template>
      </Table>
    </div>

      <div class="md:hidden p-4 space-y-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div class="space-y-3">
            <div>
              <h3 class="text-base font-semibold text-gray-900 mb-3">{{ product.name }}</h3>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <p class="text-xs text-gray-500">Quantity</p>
                <p class="text-sm font-medium text-gray-900">{{ product.quantity }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Price</p>
                <p class="text-sm font-medium text-gray-900">{{ formatCurrency(product.buying_price) }}</p>
              </div>
            </div>

            <div v-if="userStore.isAdmin" class="flex space-x-2 pt-2 border-t border-gray-100">
              <button
                @click="handleEdit(product)"
                class="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                @click="handleDelete(product.id)"
                class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed top-0 left-0 w-screen h-screen bg-gray-600 bg-opacity-50 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div class="relative bg-white rounded-lg shadow-xl border-2 border-gray-200 w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg max-h-[85vh] overflow-y-auto">
          <div class="p-4 sm:p-5 md:p-6">
            <div class="flex justify-between items-center mb-4 sm:mb-5 md:mb-6">
              <h3 class="text-base sm:text-lg md:text-xl font-medium text-gray-900">Add New Product</h3>
              <button
                @click="showCreateModal = false"
                class="text-gray-400 hover:text-gray-500 transition-colors p-1 md:p-2 rounded-full hover:bg-gray-100"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ProductForm
              :loading="productStore.loading"
              :error="productStore.error"
              @submit="handleCreate"
              @cancel="showCreateModal = false"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showEditModal && editingProduct" class="fixed top-0 left-0 w-screen h-screen bg-gray-600 bg-opacity-50 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div class="relative bg-white rounded-lg shadow-xl border-2 border-gray-200 w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg max-h-[85vh] overflow-y-auto">
          <div class="p-4 sm:p-5 md:p-6">
            <div class="flex justify-between items-center mb-4 sm:mb-5 md:mb-6">
              <h3 class="text-base sm:text-lg md:text-xl font-medium text-gray-900">Edit Product</h3>
              <button
                @click="showEditModal = false"
                class="text-gray-400 hover:text-gray-500 transition-colors p-1 md:p-2 rounded-full hover:bg-gray-100"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ProductForm
              :product="editingProduct"
              :loading="productStore.loading"
              :error="productStore.error"
              @submit="handleUpdate"
              @cancel="showEditModal = false"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useProductStore } from '../../stores/productStore'
import { useUserStore } from '../../stores/userStore'
import Table from '../../components/Table.vue'
import ProductForm from '../../components/ProductForm.vue'
import { getDefaultCurrency } from '../../utils/supabase'

const productStore = useProductStore()
const userStore = useUserStore()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingProduct = ref(null)
const searchQuery = ref('')

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return productStore.products
  }
  const query = searchQuery.value.toLowerCase().trim()
  return productStore.products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.quantity.toString().includes(query) ||
    product.buying_price.toString().includes(query)
  )
})

const currency = getDefaultCurrency()

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'buying_price', label: 'Price', type: 'currency' },
  { key: 'actions', label: 'Actions' },
]

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value)
}

onMounted(() => {
  productStore.fetchProducts()
})

function handleEdit(product) {
  editingProduct.value = { ...product }
  showEditModal.value = true
}

async function handleCreate(productData) {
  const productToCreate = {
    name: productData.name,
    quantity: productData.quantity,
    buying_price: productData.buying_price,
    selling_price: 0,
  }
  const { error } = await productStore.createProduct(productToCreate)
  if (!error) {
    showCreateModal.value = false
  }
}

async function handleUpdate(productData) {
  const { error } = await productStore.updateProduct(editingProduct.value.id, productData)
  if (!error) {
    showEditModal.value = false
    editingProduct.value = null
  }
}

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    await productStore.deleteProduct(id)
  }
}
</script>

