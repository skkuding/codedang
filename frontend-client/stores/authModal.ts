import { create } from 'zustand'

interface AuthModalStore {
  currentModal: string
  showSignIn: () => void
  showSignUp: () => void
}
const useAuthModalStore = create<AuthModalStore>(
  (set: (arg: { currentModal: string }) => void) => ({
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
  })
)

export default useAuthModalStore
