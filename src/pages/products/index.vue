<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Products</h1>
      <button
        v-if="userStore.isAdmin"
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

    <div v-if="productStore.loading" class="flex flex-col items-center justify-center py-8 sm:py-12">
      <div class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-sm text-gray-600">Loading products...</p>
    </div>

    <div v-else-if="productStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <p class="text-red-700">{{ productStore.error }}</p>
        <button @click="productStore.fetchProducts()" class="text-sm font-medium text-red-600 hover:text-red-800">
          Retry
        </button>
      </div>
    </div>

    <EmptyState
      v-else-if="productStore.products.length === 0"
      title="No products found"
      description="Get started by creating your first product."
      :action-text="userStore.isAdmin ? 'Add Product' : ''"
      @action="showCreateModal = true"
    />

    <EmptyState
      v-else-if="filteredProducts.length === 0"
      title="No products match your search"
      description="Try adjusting your search terms."
    />

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="hidden md:block">
      <Table
        :columns="columns"
        :data="paginatedProducts"
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
              @click="handleDelete(row)"
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
          v-for="product in paginatedProducts"
          :key="product.id"
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div class="space-y-3">
            <div class="flex justify-between items-start">
              <h3 class="text-base font-semibold text-gray-900">{{ product.name }}</h3>
              <p v-if="!userStore.isAdmin" class="text-sm font-medium text-gray-900">{{ formatCurrency(product.selling_price) }}</p>
            </div>

            <div v-if="userStore.isAdmin" class="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              <div>
                <p class="text-xs text-gray-500">Quantity</p>
                <p class="text-sm font-medium text-gray-900">{{ product.quantity }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Buying Price</p>
                <p class="text-sm font-medium text-gray-900">{{ formatCurrency(product.buying_price) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Selling Price</p>
                <p class="text-sm font-medium text-gray-900">{{ formatCurrency(product.selling_price) }}</p>
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
                @click="handleDelete(product)"
                class="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Pagination
        :current-page="currentPage"
        :total-items="filteredProducts.length"
        :items-per-page="itemsPerPage"
        @page-change="goToPage"
      />
    </div>

    <ModalWrapper v-model="showCreateModal" title="Add New Product">
      <ProductForm
        :loading="productStore.loading"
        :error="productStore.error"
        @submit="handleCreate"
        @cancel="showCreateModal = false"
      />
    </ModalWrapper>

    <ModalWrapper v-model="showEditModal" title="Edit Product">
      <ProductForm
        :product="editingProduct"
        :loading="productStore.loading"
        :error="productStore.error"
        @submit="handleUpdate"
        @cancel="showEditModal = false"
      />
    </ModalWrapper>

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Product"
      :message="`Are you sure you want to delete '${productToDelete?.name}'? This action cannot be undone.`"
      confirm-text="Delete"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useProductStore } from '../../stores/productStore'
import { useUserStore } from '../../stores/userStore'
import Table from '../../components/Table.vue'
import ProductForm from '../../components/ProductForm.vue'
import Pagination from '../../components/Pagination.vue'
import EmptyState from '../../components/EmptyState.vue'
import ModalWrapper from '../../components/ModalWrapper.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { formatCurrency } from '../../utils/formatters'
import { ITEMS_PER_PAGE } from '../../utils/constants'

const productStore = useProductStore()
const userStore = useUserStore()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const editingProduct = ref(null)
const productToDelete = ref(null)
const deleting = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ITEMS_PER_PAGE

const filteredProducts = computed(() => {
  let products = productStore.products
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    products = productStore.products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.quantity.toString().includes(query) ||
      (userStore.isAdmin && product.buying_price.toString().includes(query))
    )
  }
  
  return products
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset to page 1 when search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})

const columns = computed(() => {
  const baseColumns = [
    { key: 'name', label: 'Name' },
  ]

  if (userStore.isAdmin) {
    baseColumns.push({ key: 'quantity', label: 'Quantity' })
    baseColumns.push({ key: 'buying_price', label: 'Buying Price', type: 'currency' })
    baseColumns.push({ key: 'selling_price', label: 'Selling Price', type: 'currency' })
    baseColumns.push({ key: 'actions', label: 'Actions' })
  } else {
    baseColumns.push({ key: 'selling_price', label: 'Selling Price', type: 'currency' })
  }

  return baseColumns
})

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

function handleDelete(product) {
  productToDelete.value = product
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!productToDelete.value) return
  deleting.value = true
  await productStore.deleteProduct(productToDelete.value.id)
  deleting.value = false
  showDeleteDialog.value = false
  productToDelete.value = null
}
</script>

