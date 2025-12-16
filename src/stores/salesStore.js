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
            name
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
            name
          )
        `)
        .single()

      if (createError) throw createError

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: product.quantity - saleData.quantity })
        .eq('id', saleData.product_id)

      if (updateError) throw updateError

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
            name
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

  async function updateSale(id, updates) {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Get the original sale to know what to revert
      const { data: originalSale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !originalSale) throw new Error('Original sale not found')

      // 2. Get the product(s) involved
      const originalProductId = originalSale.product_id
      const newProductId = updates.product_id || originalSale.product_id

      const productIds = new Set([originalProductId, newProductId])
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', Array.from(productIds))

      if (productsError) throw productsError

      const originalProduct = products.find(p => p.id === originalProductId)
      const newProduct = products.find(p => p.id === newProductId)

      if (!originalProduct) throw new Error('Original product not found')
      if (!newProduct) throw new Error('New product not found')

      // 3. Calculate stock changes
      // Revert original sale
      let originalProductNewQuantity = originalProduct.quantity + originalSale.quantity

      // Apply new sale
      // If it's the same product
      if (originalProductId === newProductId) {
        if (originalProductNewQuantity < updates.quantity) {
          throw new Error(`Insufficient stock. Available: ${originalProductNewQuantity}`)
        }
        originalProductNewQuantity -= updates.quantity

        // Update product
        const { error: updateProductError } = await supabase
          .from('products')
          .update({ quantity: originalProductNewQuantity })
          .eq('id', originalProductId)

        if (updateProductError) throw updateProductError
      } else {
        // Different products
        // 1. Update original product (revert)
        const { error: revError } = await supabase
          .from('products')
          .update({ quantity: originalProductNewQuantity })
          .eq('id', originalProductId)
        if (revError) throw revError

        // 2. Update new product (deduct)
        if (newProduct.quantity < updates.quantity) {
          // Rollback original product update? 
          // This is getting complex without transactions.
          // Ideally we check before writing.

          // Revert the revert?
          await supabase
            .from('products')
            .update({ quantity: originalProduct.quantity })
            .eq('id', originalProductId)

          throw new Error(`Insufficient stock for new product. Available: ${newProduct.quantity}`)
        }

        const { error: newProdError } = await supabase
          .from('products')
          .update({ quantity: newProduct.quantity - updates.quantity })
          .eq('id', newProductId)

        if (newProdError) throw newProdError
      }

      // 4. Update the sale record
      // Recalculate profit
      // Profit = (selling_price - buying_price) * quantity
      // We need buying_price of the NEW product.
      const profit = (updates.selling_price - newProduct.buying_price) * updates.quantity

      const { data: updatedSale, error: updateSaleError } = await supabase
        .from('sales')
        .update({
          product_id: newProductId,
          quantity: updates.quantity,
          selling_price: updates.selling_price,
          profit: profit,
          sold_at: updates.sold_at
        })
        .eq('id', id)
        .select(`
          *,
          products (
            id,
            name
          )
        `)
        .single()

      if (updateSaleError) throw updateSaleError

      // Update local state
      const index = sales.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sales.value[index] = updatedSale
        // Re-sort sales by date
        sales.value.sort((a, b) => new Date(b.sold_at) - new Date(a.sold_at))
      }

      await productStore.fetchProducts()

      return { data: updatedSale, error: null }

    } catch (err) {
      error.value = err.message
      return { data: null, error: err.message }
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
    updateSale,
    getSalesByDateRange,
  }
})

