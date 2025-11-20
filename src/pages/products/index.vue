<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Products</h1>
      <router-link
        to="/products/create"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Add Product
      </router-link>
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

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <Table
        :columns="columns"
        :data="productStore.products"
      >
        <template #actions="{ row }">
          <div class="flex space-x-2">
            <button
              v-if="userStore.isAdmin"
              @click="handleEdit(row)"
              class="text-blue-600 hover:text-blue-900 text-sm"
            >
              Edit
            </button>
            <button
              v-if="userStore.isAdmin"
              @click="handleDelete(row.id)"
              class="text-red-600 hover:text-red-900 text-sm"
            >
              Delete
            </button>
          </div>
        </template>
      </Table>
    </div>

    <div v-if="showEditModal && editingProduct" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Product</h3>
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useProductStore } from '../../stores/productStore'
import { useUserStore } from '../../stores/userStore'
import Table from '../../components/Table.vue'
import ProductForm from '../../components/ProductForm.vue'
import { getDefaultCurrency } from '../../utils/supabase'

const productStore = useProductStore()
const userStore = useUserStore()
const showEditModal = ref(false)
const editingProduct = ref(null)

const currency = getDefaultCurrency()

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'brand', label: 'Brand' },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'buying_price', label: 'Buying Price', type: 'currency' },
  { key: 'selling_price', label: 'Selling Price', type: 'currency' },
  { key: 'actions', label: 'Actions' },
]

onMounted(() => {
  productStore.fetchProducts()
})

function handleEdit(product) {
  editingProduct.value = { ...product }
  showEditModal.value = true
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

