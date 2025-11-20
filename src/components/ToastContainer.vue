<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click.stop="removeToast(toast.id)"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  min-width: 300px;
  max-width: 400px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  pointer-events: auto;
  cursor: pointer;
  border-left: 4px solid;
  animation: slideIn 0.3s ease-out;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}

.toast-message {
  flex: 1;
  font-size: 0.875rem;
  color: #111827;
  line-height: 1.5;
}

.toast-error .toast-message {
  color: #991b1b;
}

.toast-success .toast-message {
  color: #065f46;
}

.toast-info .toast-message {
  color: #1e40af;
}

.toast-warning .toast-message {
  color: #92400e;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  margin-left: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
}

.toast-close:hover {
  background-color: #f3f4f6;
  color: #111827;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease-in-out;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease-in-out;
}
</style>

