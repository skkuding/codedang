import { create } from 'zustand'

interface AuthModalStore {
  currentModal: string
  showSignIn: () => void
  showSignUp: () => void
  hideModal: () => void
}
const useAuthModalStore = create<AuthModalStore>(
  (set: (arg: { currentModal: string }) => void) => ({
    currentModal: '',
    hideModal: () => set({ currentModal: '' }),
    showSignIn: () => {
      set({ currentModal: '' })
      setTimeout(() => {
        set({ currentModal: 'signIn' })
      }, 180)
    },
    showSignUp: () => {
      set({ currentModal: '' })
      setTimeout(() => {
        set({ currentModal: 'signUp' })
      }, 180)
    }
  })
)

export default useAuthModalStore
