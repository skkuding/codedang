import { create } from 'zustand'

interface TestcaseStore {
  order: number | null
  isHidden: boolean
  testcaseId: number
  setSelectedTestcase: (
    order: number | null,
    isHidden: boolean,
    testcaseId: number
  ) => void
  isTestResult: boolean
  setIsTestResult: (isTestResult: boolean) => void
}

export const useTestcaseStore = create<TestcaseStore>((set) => ({
  order: null,
  isHidden: false,
  testcaseId: 0,
  setSelectedTestcase: (order, isHidden, testcaseId) =>
    set({ order, isHidden, testcaseId }),
  isTestResult: false,
  setIsTestResult: (isTestResult) => set({ isTestResult })
}))
