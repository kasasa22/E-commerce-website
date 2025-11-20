<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5 md:space-y-6">
    <div>
      <label for="name" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Name *
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2.5"
        placeholder="Enter seller's full name"
      />
    </div>

    <div>
      <label for="email" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Email *
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        required
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2.5"
        placeholder="seller@example.com"
      />
    </div>

    <div>
      <label for="password" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
        Password *
      </label>
      <input
        id="password"
        v-model="formData.password"
        type="password"
        required
        minlength="6"
        class="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base px-3 py-2.5"
        placeholder="Minimum 6 characters"
      />
      <p class="mt-1.5 text-xs sm:text-sm text-gray-500">
        Password must be at least 6 characters long
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
      <button
        type="submit"
        :disabled="loading"
        class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading">Creating...</span>
        <span v-else>Create Seller</span>
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        :disabled="loading"
        class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  name: '',
  email: '',
  password: ''
})

function handleSubmit() {
  emit('submit', { ...formData.value })
  // Reset form
  formData.value = {
    name: '',
    email: '',
    password: ''
  }
}
</script>

