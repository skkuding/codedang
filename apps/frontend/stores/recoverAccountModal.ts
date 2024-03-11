import { create } from 'zustand'

interface FormData {
  email: string
  verificationCode: string
  headers: {
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    'email-auth': string
  }
}

interface RecoverAccountModalStore {
  modalPage: number
  formData: {
    email: string
    verificationCode: string
    headers: {
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
      'email-auth': string
    }
  }
  setModalPage: (page: number) => void
  setFormData: (data: FormData) => void
  nextModal: () => void
  backModal: () => void
}
const useRecoverAccountModalStore = create<RecoverAccountModalStore>((set) => ({
  modalPage: 0,
  formData: {
    email: '',
    verificationCode: '',
    headers: {
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
      'email-auth': ''
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

export default useRecoverAccountModalStore
