import { create } from 'zustand'

interface EditorStore {
  code: string
  setCode: (code: string) => void
  clearCode: () => void
}

const useEditorStore = create<EditorStore>((set) => ({
  code: '',
  setCode: (code: string) => set({ code }),
  clearCode: () => set({ code: '' })
}))

export default useEditorStore
