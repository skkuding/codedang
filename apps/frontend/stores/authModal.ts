import { create } from 'zustand'

interface AuthModalStore {
  currentModal: string
  showSignIn: () => void
  showSignUp: () => void
  showRecoverAccount: () => void
  hideModal: () => void
}

export const useAuthModalStore = create<AuthModalStore>(
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
    },
    showRecoverAccount: () => {
      set({ currentModal: '' })
      setTimeout(() => {
        set({ currentModal: 'recoverAccount' })
      }, 180)
    }
  })
)
