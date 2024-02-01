import { create } from 'zustand'

interface EditorStore {
  code: string
  language: string
  setLanguage: (language: string) => void
  setCode: (code: string) => void
  clearCode: () => void
}

const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  language: '',
  setLanguage: (language: string) => {
    localStorage.setItem('programming_lang', language)
    set({ language })
  },
  setCode: (code: string) => set({ code }),
  clearCode: () => set({ code: '' })
}))

export default useEditorStore
