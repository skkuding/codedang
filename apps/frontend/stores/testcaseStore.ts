import { create } from 'zustand'

interface TestcaseStore {
  selectedTestcaseId: number | null
  setSelectedTestcaseId: (id: number | null) => void
}

export const useTestcaseStore = create<TestcaseStore>((set) => ({
  selectedTestcaseId: null,
  setSelectedTestcaseId: (id) => set({ selectedTestcaseId: id })
}))
