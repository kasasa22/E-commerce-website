import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import { useProductStore } from './productStore'

export const useSalesStore = defineStore('sales', () => {
  const sales = ref([])
  const loading = ref(false)
  const error = ref(null)
  const productStore = useProductStore()

  const dailySales = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return sales.value.filter(sale => {
      const saleDate = new Date(sale.sold_at).toISOString().split('T')[0]
      return saleDate === today
    })
  })

  const monthlySales = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    return sales.value.filter(sale => {
      const saleDate = new Date(sale.sold_at)
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
    })
  })

  const yearlySales = computed(() => {
    const currentYear = new Date().getFullYear()
    return sales.value.filter(sale => {
      const saleDate = new Date(sale.sold_at)
      return saleDate.getFullYear() === currentYear
    })
  })

  const totalProfit = computed(() => {
    return sales.value.reduce((sum, sale) => sum + (sale.profit || 0), 0)
  })

  const dailyProfit = computed(() => {
    return dailySales.value.reduce((sum, sale) => sum + (sale.profit || 0), 0)
  })

  const monthlyProfit = computed(() => {
    return monthlySales.value.reduce((sum, sale) => sum + (sale.profit || 0), 0)
  })

  const yearlyProfit = computed(() => {
    return yearlySales.value.reduce((sum, sale) => sum + (sale.profit || 0), 0)
  })

  async function fetchSales() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('sales')
        .select(`
          *,
          products (
            id,
            name,
            brand,
            type,
            category
          )
        `)
        .order('sold_at', { ascending: false })

      if (fetchError) throw fetchError
      sales.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Fetch sales error:', err)
    } finally {
      loading.value = false
    }
  }

  async function createSale(saleData) {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const product = productStore.getProductById(saleData.product_id)
      if (!product) throw new Error('Product not found')

      if (product.quantity < saleData.quantity) {
        throw new Error('Insufficient stock')
      }

      const profit = (saleData.selling_price - product.buying_price) * saleData.quantity

      const { data, error: createError } = await supabase
        .from('sales')
        .insert([{
          product_id: saleData.product_id,
          quantity: saleData.quantity,
          selling_price: saleData.selling_price,
          profit,
          sold_by: user.id,
          sold_at: saleData.sold_at || new Date().toISOString(),
        }])
        .select(`
          *,
          products (
            id,
            name,
            brand,
            type,
            category
          )
        `)
        .single()

      if (createError) throw createError

      await supabase
        .from('products')
        .update({ quantity: product.quantity - saleData.quantity })
        .eq('id', saleData.product_id)

      sales.value.unshift(data)
      await productStore.fetchProducts()

      return { data, error: null }
    } catch (err) {
      error.value = err.message
      return { data: null, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function getSalesByDateRange(startDate, endDate) {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('sales')
        .select(`
          *,
          products (
            id,
            name,
            brand,
            type,
            category
          )
        `)
        .gte('sold_at', startDate)
        .lte('sold_at', endDate)
        .order('sold_at', { ascending: false })

      if (fetchError) throw fetchError
      return { data: data || [], error: null }
    } catch (err) {
      error.value = err.message
      return { data: [], error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    sales,
    loading,
    error,
    dailySales,
    monthlySales,
    yearlySales,
    totalProfit,
    dailyProfit,
    monthlyProfit,
    yearlyProfit,
    fetchSales,
    createSale,
    getSalesByDateRange,
  }
})

