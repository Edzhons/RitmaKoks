import { defineStore } from 'pinia'

import { apiRequest, ApiError, prepareCsrfCookie } from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    initialized: false,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async initialize() {
      if (this.initialized) return

      try {
        this.user = (await apiRequest('/api/user')).data
        this.error = null
        this.initialized = true
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          this.user = null
          this.error = null
          this.initialized = true
        } else {
          this.error = error.message
          throw error
        }
      }
    },
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        await prepareCsrfCookie()
        this.user = (await apiRequest('/api/login', { method: 'POST', body: credentials })).data
        this.initialized = true
      } catch (error) {
        this.error = error.status === 422 ? null : error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    async register(details) {
      this.loading = true
      this.error = null
      try {
        await prepareCsrfCookie()
        this.user = (await apiRequest('/api/register', { method: 'POST', body: details })).data
        this.initialized = true
      } catch (error) {
        this.error = error.status === 422 ? null : error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await apiRequest('/api/logout', { method: 'POST' })
      this.user = null
      this.error = null
    },
    async requestPasswordReset(email) {
      await prepareCsrfCookie()
      return apiRequest('/api/forgot-password', { method: 'POST', body: { email } })
    },
    async resetPassword(details) {
      await prepareCsrfCookie()
      return apiRequest('/api/reset-password', { method: 'POST', body: details })
    },
  },
})
