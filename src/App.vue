<template>
  <router-view />
  <ToastContainer />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import ToastContainer from './components/ToastContainer.vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.checkAuth()
})
</script>
