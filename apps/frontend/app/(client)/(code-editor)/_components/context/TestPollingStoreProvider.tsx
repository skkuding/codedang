import { createContext, useContext, useRef, type ReactNode } from 'react'
import { create, useStore } from 'zustand'

interface TestPollingState {
  isTesting: boolean
  setIsTesting: (v: boolean) => void
  nonUserPollingEnabled: boolean
  userPollingEnabled: boolean
  startPolling: () => void
  stopPolling: (type: 'non-user' | 'user') => void
}

const createTestPollingStore = () =>
  create<TestPollingState>((set) => ({
    isTesting: false,
    setIsTesting: (isTesting) => set((state) => ({ ...state, isTesting })),
    nonUserPollingEnabled: false,
    userPollingEnabled: false,
    startPolling: () => {
      set((state) => ({
        ...state,
        nonUserPollingEnabled: true,
        userPollingEnabled: true
      }))
    },
    stopPolling: (type) => {
      set((state) => ({
        ...state,
        nonUserPollingEnabled:
          type === 'non-user' ? false : state.nonUserPollingEnabled,
        userPollingEnabled: type === 'user' ? false : state.userPollingEnabled
      }))
    }
  }))

type TestPollingStore = ReturnType<typeof createTestPollingStore>

const TestPollingStoreContext = createContext<TestPollingStore | null>(null)

export function TestPollingStoreProvider({
  children
}: {
  children: ReactNode
}) {
  const storeRef = useRef<TestPollingStore>(undefined)
  if (!storeRef.current) {
    storeRef.current = createTestPollingStore()
  }

  return (
    <TestPollingStoreContext.Provider value={storeRef.current}>
      {children}
    </TestPollingStoreContext.Provider>
  )
}

export function useTestPollingStore<T>(
  selector: (state: TestPollingState) => T
) {
  const store = useContext(TestPollingStoreContext)

  if (store === null) {
    throw new Error(
      'useTestPollingStore should be used within TestPollingStoreProvider'
    )
  }

  return useStore(store, selector)
}
