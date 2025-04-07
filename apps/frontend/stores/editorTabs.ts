import { create } from 'zustand'

export const RUN_CODE_TAB = 'Run Code'
export const TESTCASE_RESULT_TAB = 'Testcase Result'
type TestcaseTab = typeof RUN_CODE_TAB | typeof TESTCASE_RESULT_TAB

interface TestcaseTabState {
  activeTab: TestcaseTab
  setActiveTab: (tab: TestcaseTab) => void
}

export const useTestcaseTabStore = create<TestcaseTabState>((set) => ({
  activeTab: 'Run Code',
  setActiveTab: (tab) => set({ activeTab: tab })
}))

interface LeftPanelState {
  isPanelHidden: boolean
  togglePanelVisibility: () => void
}

export const useLeftPanelTabStore = create<LeftPanelState>((set) => ({
  isPanelHidden: false,
  togglePanelVisibility: () =>
    set((state) => ({
      isPanelHidden: !state.isPanelHidden
    }))
}))
