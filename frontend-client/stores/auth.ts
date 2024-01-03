import { create } from 'zustand'

interface AuthStore {
  currentModal: string
  showSignIn: () => void
  showSignUp: () => void
}
const useAuthStore = create<AuthStore>((set) => ({
  currentModal: '',
  showSignIn: () => {
    set({ currentModal: '' })
    setTimeout(() => {
      set({ currentModal: 'signIn' })
    }, 150)
  },
  showSignUp: () => {
    set({ currentModal: '' })
    setTimeout(() => {
      set({ currentModal: 'signUp' })
    }, 150)
  }
}))

export default useAuthStore
