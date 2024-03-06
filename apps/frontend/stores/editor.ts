import type { Language } from '@/types/type'
import { create } from 'zustand'

interface EditorStore {
  code: string
  language: Language
  setLanguage: (language: Language) => void
  setCode: (code: string) => void
  clearCode: () => void
}

const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  language: 'C',
  setLanguage: (language) => {
    localStorage.setItem('programming_lang', language)
    set({ language })
  },
  setCode: (code: string) => set({ code }),
  clearCode: () => set({ code: '' })
}))

export default useEditorStore
