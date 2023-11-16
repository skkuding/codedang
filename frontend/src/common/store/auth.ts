import { useToast } from '@/common/composables/toast'
import { useStorage } from '@vueuse/core'
import axios from 'axios'
import { defineStore } from 'pinia'

const openToast = useToast()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: useStorage('isLoggedIn', false)
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const res = await axios.post(
          '/api/auth/login',
          { username, password },
          { withCredentials: true } // for local development
        )
        axios.defaults.headers.common.authorization = res.headers.authorization
        this.isLoggedIn = true
        openToast({ message: 'Login succeed!', type: 'success' })
      } catch (e) {
        openToast({ message: 'Login failed!', type: 'error' })
        throw new Error('Login failed')
      }
    },

    async logout() {
      try {
        await axios.post('/api/auth/logout')
        delete axios.defaults.headers.common.authorization
        this.isLoggedIn = false
      } catch (e) {
        openToast({ message: 'Logout failed!', type: 'error' })
        throw new Error('Logout failed')
      }
    },

    async reissue() {
      try {
        const res = await axios.get('/api/auth/reissue', {
          // Send cross-site cookie in development mode
          withCredentials: import.meta.env.DEV
        })
        axios.defaults.headers.common.authorization = res.headers.authorization
        this.isLoggedIn = true
      } catch (e) {
        this.isLoggedIn = false
      }
    }
  }
})
