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

type LeftPanelTab = 'Description' | 'Submissions' | string

interface LeftPanelTabState {
  visibleTabs: Set<LeftPanelTab>
  isLeftPanelTabVisible: (tab: LeftPanelTab) => boolean
  showLeftPanelTab: (tab: LeftPanelTab) => void
  hideLeftPanelTab: (tab: LeftPanelTab) => void
}

export const useLeftPanelTabStore = create<LeftPanelTabState>((set) => ({
  visibleTabs: new Set<LeftPanelTab>(['Description']),
  isLeftPanelTabVisible: (tab) => {
    let isVisible = false
    set((state) => {
      isVisible = state.visibleTabs.has(tab)
      return state
    })
    return isVisible
  },
  showLeftPanelTab: (tab) =>
    set((state) => ({
      visibleTabs: new Set(state.visibleTabs).add(tab)
    })),
  hideLeftPanelTab: (tab) =>
    set((state) => {
      const newVisibleTabs = new Set(state.visibleTabs)
      newVisibleTabs.delete(tab)
      return { visibleTabs: newVisibleTabs }
    })
}))
