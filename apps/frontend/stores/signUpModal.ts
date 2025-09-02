import { create } from 'zustand'

interface FormData {
  username: string
  password: string
  email: string
  realName: string
  studentId: string
  affiliation: string
  major: string
  headers: {
    'email-auth': string
  }
}
interface SignUpModalStore {
  modalPage: number
  formData: FormData
  setModalPage: (page: number) => void
  setFormData: (data: FormData) => void
  nextModal: () => void
  backModal: () => void
}

export const useSignUpModalStore = create<SignUpModalStore>((set) => ({
  modalPage: 0,
  formData: {
    username: '',
    password: '',
    realName: '',
    studentId: '',
    affiliation: '',
    major: '',
    email: '',
    verificationCode: '',
    headers: {
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
