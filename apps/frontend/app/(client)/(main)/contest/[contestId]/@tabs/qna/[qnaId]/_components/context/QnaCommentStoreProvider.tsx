import { create } from 'zustand'

interface QnaCommentSync {
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useQnaCommentSync = create<QnaCommentSync>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }))
}))
