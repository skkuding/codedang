import { create } from 'zustand'

interface LeaderboardSync {
  refreshTrigger: number // 새로고침 트리거 (숫자 값이 바뀌면 감지됨)
  triggerRefresh: () => void
}

export const useLeaderboardSync = create<LeaderboardSync>((set) => ({
  refreshTrigger: 0, // 초기값 0
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })) // 값 증가
}))
