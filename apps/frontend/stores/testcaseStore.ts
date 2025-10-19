import { create } from 'zustand'

interface TestcaseStore {
  order: number | null
  isHidden: boolean
  setSelectedTestcase: (order: number | null, isHidden: boolean) => void
  isTestResult: boolean
  setIsTestResult: (isTestResult: boolean) => void
}

export const useTestcaseStore = create<TestcaseStore>((set) => ({
  order: null,
  isHidden: false,
  setSelectedTestcase: (order, isHidden) => set({ order, isHidden }),
  isTestResult: false,
  setIsTestResult: (isTestResult) => set({ isTestResult })
}))
