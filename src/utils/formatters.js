import { getDefaultCurrency } from './supabase'

export function formatCurrency(value) {
  const currency = getDefaultCurrency()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'UGX' ? 'UGX' : 'USD',
  }).format(value || 0)
}

export function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

export function formatDateTime(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

export function getDateString(dateValue) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
