import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, supabaseAdmin } from '../utils/supabase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const isSuperadmin = computed(() => userRole.value === 'superadmin')
  const isAdmin = computed(() => userRole.value === 'admin' || isSuperadmin.value)
  const isSeller = computed(() => userRole.value === 'seller' || isAdmin.value)

  async function signIn(email, password) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userError) throw userError

        user.value = { ...data.user, ...userData }
        session.value = data.session
      }

      return { error: null }
    } catch (error) {
      return { error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      session.value = null
      return { error: null }
    } catch (error) {
      return { error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function checkAuth() {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (currentSession?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()

        if (!error && userData) {
          user.value = { ...currentSession.user, ...userData }
          session.value = currentSession
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    }
  }

  async function fetchUser() {
    if (!session.value?.user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.value.user.id)
        .single()

      if (error) throw error
      if (data) {
        user.value = { ...session.value.user, ...data }
      }
    } catch (error) {
      console.error('Fetch user error:', error)
    }
  }

  async function fetchUsers() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error.message }
    } finally {
      loading.value = false
    }
  }

  async function createSeller(sellerData) {
    loading.value = true
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) throw new Error('Not authenticated')

      // Check if user has permission (admin or superadmin)
      const userRole = user.value?.role
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        throw new Error('Only admins and superadmins can create sellers')
      }

      // Check if admin client is available
      if (!supabaseAdmin) {
        throw new Error('Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file. You can find it in Supabase Dashboard > Settings > API > service_role key (secret)')
      }

      // Create auth user using admin client
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: sellerData.email,
        password: sellerData.password,
        email_confirm: true,
        user_metadata: {
          name: sellerData.name,
          role: 'seller'
        }
      })

      if (authError) {
        // Provide more helpful error messages
        if (authError.message.includes('invalid') && authError.message.includes('key')) {
          throw new Error('Invalid service role key. Please check your SUPABASE_SERVICE_ROLE_KEY in .env file. Make sure you copied the full key from Supabase Dashboard > Settings > API.')
        }
        throw authError
      }

      // The trigger will automatically create the user profile in public.users
      // But we need to ensure the role is set correctly
      if (authData.user) {
        // Wait a moment for the trigger to create the user profile
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'seller' })
          .eq('id', authData.user.id)

        if (updateError) throw updateError
      }

      return { data: authData.user, error: null }
    } catch (error) {
      console.error('Create seller error:', error)
      return { data: null, error: error.message || 'Failed to create seller' }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    userRole,
    isSuperadmin,
    isAdmin,
    isSeller,
    signIn,
    signOut,
    checkAuth,
    fetchUser,
    fetchUsers,
    createSeller,
  }
})

