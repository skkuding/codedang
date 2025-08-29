import { create } from 'zustand'

interface QnaCommentsSync {
  refreshTrigger: number

  triggerRefresh: () => void
}

export const useQnaCommentsSync = create<QnaCommentsSync>((set) => ({
  refreshTrigger: 0,

  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }))
}))
