import { create } from 'zustand'

interface AuthModalStore {
  currentModal: string
  initCurrentModal: () => void
  showSignIn: () => void
  showSignUp: () => void
  showRecoverAccount: () => void
  hideModal: () => void
}
const useAuthModalStore = create<AuthModalStore>(
  (set: (arg: { currentModal: string }) => void) => ({
    currentModal: '',
    initCurrentModal: () => set({ currentModal: '' }),
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
    },
    showRecoverAccount: () => {
      set({ currentModal: '' })
      setTimeout(() => {
        set({ currentModal: 'recoverAccount' })
      }, 180)
    }
  })
)

export default useAuthModalStore
