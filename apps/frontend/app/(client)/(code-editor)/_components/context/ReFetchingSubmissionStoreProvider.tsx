import { create } from 'zustand'

interface SubmissionSync {
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useSubmissionSync = create<SubmissionSync>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }))
}))
