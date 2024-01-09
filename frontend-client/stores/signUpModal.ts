import { create } from 'zustand'

interface FormData {
  email: string
  verificationCode: string
  headers: {
    /* eslint-disable */
    'email-auth': string
    /* eslint-disable */
  }
}
interface SignUpModalStore {
  modalPage: number
  formData: {
    email: string
    verificationCode: string
    headers: {
      /* eslint-disable */
      'email-auth': string
      /* eslint-disable */
    }
  }
  setModalPage: (page: number) => void
  setFormData: (data: FormData) => void
  nextModal: () => void
  backModal: () => void
}
const useSignUpModalStore = create<SignUpModalStore>((set) => ({
  modalPage: 0,
  formData: {
    email: '',
    verificationCode: '',
    headers: {
      /* eslint-disable */
      'email-auth': ''
      /* eslint-disable */
    }
  },
  setModalPage: (page: number) => set({ modalPage: page }),
  setFormData: (data: FormData) => set({ formData: data }),
  nextModal: () =>
    set((state: { modalPage: number }) => ({
      modalPage: state.modalPage + 1
    })),
  backModal: () =>
    set((state: { modalPage: number }) => ({
      modalPage: state.modalPage - 1
    }))
}))

export default useSignUpModalStore
