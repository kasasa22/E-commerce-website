import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

export const useFinanceStore = defineStore('finance', {
    state: () => ({
        debtors: [],
        creditors: [],
        payments: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchDebtors() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('debtors')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                this.debtors = data
            } catch (error) {
                this.error = error.message
                console.error('Error fetching debtors:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchCreditors() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('creditors')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                this.creditors = data
            } catch (error) {
                this.error = error.message
                console.error('Error fetching creditors:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchById(id, type) {
            this.loading = true
            try {
                const table = type === 'debtor' ? 'debtors' : 'creditors'
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                return data
            } catch (error) {
                console.error(`Error fetching ${type}:`, error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchPayments(targetId, type) {
            try {
                const query = supabase
                    .from('finance_payments')
                    .select('*')
                    .order('payment_date', { ascending: false })

                if (type === 'debtor') {
                    query.eq('debtor_id', targetId)
                } else {
                    query.eq('creditor_id', targetId)
                }

                const { data, error } = await query
                if (error) throw error
                return data
            } catch (error) {
                console.error('Error fetching payments:', error)
                throw error
            }
        },

        async fetchAllPayments() {
            try {
                const { data, error } = await supabase
                    .from('finance_payments')
                    .select('*, debtors(id, name), creditors(id, name)')
                    .order('payment_date', { ascending: false })

                if (error) throw error
                this.payments = data
                return data
            } catch (error) {
                console.error('Error fetching all payments:', error)
                throw error
            }
        },

        async addDebtor(debtor) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const { data, error } = await supabase
                    .from('debtors')
                    .insert([{
                        ...debtor,
                        remaining_amount: debtor.total_amount,
                        created_by: user.id
                    }])
                    .select()

                if (error) throw error
                this.debtors.unshift(data[0])
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async addCreditor(creditor) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const { data, error } = await supabase
                    .from('creditors')
                    .insert([{
                        ...creditor,
                        remaining_amount: creditor.total_amount,
                        created_by: user.id
                    }])
                    .select()

                if (error) throw error
                this.creditors.unshift(data[0])
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async addPayment(paymentData, type) {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                // 1. Insert payment
                const { data: payment, error: paymentError } = await supabase
                    .from('finance_payments')
                    .insert([{ ...paymentData, created_by: user.id }])
                    .select()
                    .single()

                if (paymentError) throw paymentError

                // 2. Update debtor/creditor remaining amount
                const table = type === 'debtor' ? 'debtors' : 'creditors'
                const targetId = type === 'debtor' ? paymentData.debtor_id : paymentData.creditor_id

                const target = (type === 'debtor' ? this.debtors : this.creditors).find(i => i.id === targetId)
                if (!target) throw new Error('Target not found')

                const newRemaining = Number(target.remaining_amount) - Number(paymentData.amount)
                const newStatus = newRemaining <= 0 ? 'paid' : 'partial'

                const { data: updatedTarget, error: updateError } = await supabase
                    .from(table)
                    .update({
                        remaining_amount: newRemaining,
                        status: newStatus
                    })
                    .eq('id', targetId)
                    .select()
                    .single()

                if (updateError) throw updateError

                // 3. Update local state
                const list = type === 'debtor' ? this.debtors : this.creditors
                const index = list.findIndex(i => i.id === targetId)
                if (index !== -1) list[index] = updatedTarget

                return payment
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async updateDebtor(id, updates) {
            try {
                const { data, error } = await supabase
                    .from('debtors')
                    .update(updates)
                    .eq('id', id)
                    .select()

                if (error) throw error
                const index = this.debtors.findIndex(d => d.id === id)
                if (index !== -1) this.debtors[index] = data[0]
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async updateCreditor(id, updates) {
            try {
                const { data, error } = await supabase
                    .from('creditors')
                    .update(updates)
                    .eq('id', id)
                    .select()

                if (error) throw error
                const index = this.creditors.findIndex(c => c.id === id)
                if (index !== -1) this.creditors[index] = data[0]
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async deleteDebtor(id) {
            try {
                const { error } = await supabase
                    .from('debtors')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                this.debtors = this.debtors.filter(d => d.id !== id)
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async deleteCreditor(id) {
            try {
                const { error } = await supabase
                    .from('creditors')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                this.creditors = this.creditors.filter(c => c.id !== id)
            } catch (error) {
                this.error = error.message
                throw error
            }
        }
    }
})
