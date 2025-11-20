<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Add New Product</h1>
    </div>

    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <ProductForm
          :loading="productStore.loading"
          :error="productStore.error"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useProductStore } from '../../stores/productStore'
import ProductForm from '../../components/ProductForm.vue'

const router = useRouter()
const productStore = useProductStore()

async function handleSubmit(productData) {
  const { error } = await productStore.createProduct(productData)
  if (!error) {
    router.push({ name: 'products' })
  }
}

function handleCancel() {
  router.push({ name: 'products' })
}
</script>

