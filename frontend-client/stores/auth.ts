import { create } from 'zustand'

interface AuthStore {
  currentModal: string
  showSignIn: () => void
  showSignUp: () => void
}
const useAuthStore = create<AuthStore>((set) => ({
  currentModal: '',
  showSignIn: () => set({ currentModal: 'signIn' }),
  showSignUp: () => set({ currentModal: 'signUp' })
}))

export default useAuthStore
