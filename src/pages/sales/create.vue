<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">New Sale</h1>
    </div>

    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <SalesForm
          :loading="salesStore.loading"
          :error="salesStore.error"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSalesStore } from '../../stores/salesStore'
import { useProductStore } from '../../stores/productStore'
import SalesForm from '../../components/SalesForm.vue'

const router = useRouter()
const salesStore = useSalesStore()
const productStore = useProductStore()

onMounted(() => {
  productStore.fetchProducts()
})

async function handleSubmit(saleData) {
  const { error } = await salesStore.createSale(saleData)
  if (!error) {
    router.push({ name: 'sales' })
  }
}

function handleCancel() {
  router.push({ name: 'sales' })
}
</script>

