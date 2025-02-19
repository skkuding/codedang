import { create } from 'zustand'

interface LeaderboardSync {
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useLeaderboardSync = create<LeaderboardSync>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 }))
}))
