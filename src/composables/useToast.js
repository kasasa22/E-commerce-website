import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  const showToast = (message, type = 'error') => {
    const id = Date.now()
    const toast = {
      id,
      message,
      type,
    }
    
    toasts.value.push(toast)
    
    setTimeout(() => {
      removeToast(id)
    }, 5000)
    
    return id
  }
  
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  return {
    toasts,
    showToast,
    removeToast,
  }
}

