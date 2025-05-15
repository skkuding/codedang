import { create } from 'zustand'

interface SubmissionDetailSync {
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useSubmissionDetailSync = create<SubmissionDetailSync>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }))
}))
