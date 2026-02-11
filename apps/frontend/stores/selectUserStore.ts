import { create } from 'zustand'

interface UserSelectionState {
  selectedUserIds: Set<string>
  showOnlySelected: boolean

  toggleUser: (userId: string) => void
  setShowOnlySelected: (value: boolean) => void

  isSelected: (userId: string) => boolean
}

export const useUserSelectionStore = create<UserSelectionState>((set, get) => ({
  selectedUserIds: new Set(),
  showOnlySelected: false,

  toggleUser: (userId) =>
    set((state) => {
      const next = new Set(state.selectedUserIds)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return { selectedUserIds: next }
    }),

  setShowOnlySelected: (value) => set({ showOnlySelected: value }),

  isSelected: (userId) => get().selectedUserIds.has(userId)
}))
