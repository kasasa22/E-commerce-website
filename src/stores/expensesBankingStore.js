import { defineStore } from 'pinia'
import { supabase } from '../utils/supabase'

export const useExpensesBankingStore = defineStore('expensesBanking', {
    state: () => ({
        expenses: [],
        banks: [],
        deposits: [],
        dailyBalances: [],
        loading: false,
        error: null,
    }),

    getters: {
        totalExpenses: (state) => {
            return state.expenses.reduce((sum, e) => sum + Number(e.amount), 0)
        },
        todayExpenses: (state) => {
            const today = new Date().toISOString().split('T')[0]
            return state.expenses
                .filter(e => e.expense_date === today)
                .reduce((sum, e) => sum + Number(e.amount), 0)
        },
        expensesByCategory: (state) => {
            const grouped = {}
            state.expenses.forEach(e => {
                if (!grouped[e.category]) grouped[e.category] = 0
                grouped[e.category] += Number(e.amount)
            })
            return grouped
        },

        totalAllBanks: (state) => {
            return state.deposits.reduce((sum, d) => sum + Number(d.amount), 0)
        },
        todayDeposits: (state) => {
            const today = new Date().toISOString().split('T')[0]
            return state.deposits
                .filter(d => d.deposit_date === today)
                .reduce((sum, d) => sum + Number(d.amount), 0)
        },
        depositsByBank: (state) => {
            const grouped = {}
            state.deposits.forEach(d => {
                const bankId = d.bank_id
                if (!grouped[bankId]) {
                    grouped[bankId] = {
                        bank: d.banks,
                        total: 0,
                        count: 0
                    }
                }
                grouped[bankId].total += Number(d.amount)
                grouped[bankId].count++
            })
            return grouped
        },
        activeBanks: (state) => {
            return state.banks.filter(b => b.is_active)
        }
    },

    actions: {
        async fetchExpenses() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('expenses')
                    .select('*')
                    .order('expense_date', { ascending: false })

                if (error) throw error
                this.expenses = data
            } catch (error) {
                this.error = error.message
                console.error('Error fetching expenses:', error)
            } finally {
                this.loading = false
            }
        },

        async addExpense(expense) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const { data, error } = await supabase
                    .from('expenses')
                    .insert([{
                        ...expense,
                        created_by: user.id
                    }])
                    .select()

                if (error) throw error
                this.expenses.unshift(data[0])
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async updateExpense(id, updates) {
            try {
                const { data, error } = await supabase
                    .from('expenses')
                    .update(updates)
                    .eq('id', id)
                    .select()

                if (error) throw error
                const index = this.expenses.findIndex(e => e.id === id)
                if (index !== -1) this.expenses[index] = data[0]
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async deleteExpense(id) {
            try {
                const { error } = await supabase
                    .from('expenses')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                this.expenses = this.expenses.filter(e => e.id !== id)
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async fetchBanks() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('banks')
                    .select('*')
                    .order('name', { ascending: true })

                if (error) throw error
                this.banks = data
            } catch (error) {
                this.error = error.message
                console.error('Error fetching banks:', error)
            } finally {
                this.loading = false
            }
        },

        async addBank(bank) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const { data, error } = await supabase
                    .from('banks')
                    .insert([{
                        ...bank,
                        created_by: user.id
                    }])
                    .select()

                if (error) throw error
                this.banks.push(data[0])
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async updateBank(id, updates) {
            try {
                const { data, error } = await supabase
                    .from('banks')
                    .update(updates)
                    .eq('id', id)
                    .select()

                if (error) throw error
                const index = this.banks.findIndex(b => b.id === id)
                if (index !== -1) this.banks[index] = data[0]
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async deleteBank(id) {
            try {
                const { error } = await supabase
                    .from('banks')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                this.banks = this.banks.filter(b => b.id !== id)
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async fetchDeposits() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('bank_deposits')
                    .select('*, banks(id, name)')
                    .order('created_at', { ascending: false })

                if (error) throw error
                this.deposits = data
            } catch (error) {
                this.error = error.message
                console.error('Error fetching deposits:', error)
            } finally {
                this.loading = false
            }
        },

        async addDeposit(deposit) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const { data, error } = await supabase
                    .from('bank_deposits')
                    .insert([{
                        ...deposit,
                        deposited_by: user.id
                    }])
                    .select('*, banks(id, name)')

                if (error) throw error
                this.deposits.unshift(data[0])
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async updateDeposit(id, updates) {
            try {
                const { data, error } = await supabase
                    .from('bank_deposits')
                    .update(updates)
                    .eq('id', id)
                    .select('*, banks(id, name)')

                if (error) throw error
                const index = this.deposits.findIndex(d => d.id === id)
                if (index !== -1) this.deposits[index] = data[0]
                return data[0]
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        async deleteDeposit(id) {
            try {
                const { error } = await supabase
                    .from('bank_deposits')
                    .delete()
                    .eq('id', id)

                if (error) throw error
                this.deposits = this.deposits.filter(d => d.id !== id)
            } catch (error) {
                this.error = error.message
                throw error
            }
        },

        getBankById(id) {
            return this.banks.find(b => b.id === id)
        },

        async fetchDailyBalances() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('daily_balances')
                    .select('*')
                    .order('balance_date', { ascending: false })

                if (error) throw error
                this.dailyBalances = data
            } catch (error) {
                this.error = error.message
                console.error('Error fetching daily balances:', error)
            } finally {
                this.loading = false
            }
        },

        async getBalanceBD(date) {
            const prevDate = new Date(date)
            prevDate.setDate(prevDate.getDate() - 1)
            const prevDateStr = prevDate.toISOString().split('T')[0]

            const balance = this.dailyBalances.find(b => b.balance_date === prevDateStr)
            return balance ? Number(balance.balance_cd) : 0
        },

        async getBalanceCD(date) {
            const balance = this.dailyBalances.find(b => b.balance_date === date)
            return balance ? Number(balance.balance_cd) : null
        },

        async saveBalanceCD(date, amount) {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                const existingBalance = this.dailyBalances.find(b => b.balance_date === date)

                if (existingBalance) {
                    const { data, error } = await supabase
                        .from('daily_balances')
                        .update({ balance_cd: amount })
                        .eq('id', existingBalance.id)
                        .select()

                    if (error) throw error
                    const index = this.dailyBalances.findIndex(b => b.id === existingBalance.id)
                    if (index !== -1) this.dailyBalances[index] = data[0]
                    return data[0]
                } else {
                    const { data, error } = await supabase
                        .from('daily_balances')
                        .insert([{
                            balance_date: date,
                            balance_cd: amount,
                            created_by: user.id
                        }])
                        .select()

                    if (error) throw error
                    this.dailyBalances.unshift(data[0])
                    return data[0]
                }
            } catch (error) {
                this.error = error.message
                throw error
            }
        }
    }
})
