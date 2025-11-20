import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'

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
  }
})

