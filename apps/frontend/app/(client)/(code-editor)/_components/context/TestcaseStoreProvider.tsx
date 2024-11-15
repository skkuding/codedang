import type { TestcaseItem } from '@/types/type'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { createStore, useStore } from 'zustand'
import { persist } from 'zustand/middleware'

interface TestcaseState {
  sampleTestcases: TestcaseItem[]
  userTestcases: TestcaseItem[]
  setUserTestcases: (value: TestcaseItem[]) => void
  getTestcases: () => (TestcaseItem & { isUserTestcase: boolean })[]
  getUserTestcases: () => TestcaseItem[]
}

const createTestcaseStore = (
  problemId: number,
  sampleTestcases: TestcaseItem[]
) => {
  const storageKey = `user_testcase_${problemId}`

  return createStore<TestcaseState>()(
    persist(
      (set, get) => ({
        sampleTestcases,
        userTestcases: [],
        setUserTestcases: (testcases: TestcaseItem[]) => {
          return set((state) => ({ ...state, userTestcases: testcases }))
        },
        getUserTestcases: () => get().userTestcases,
        getTestcases: () => {
          const { sampleTestcases, userTestcases } = get()
          return [
            ...sampleTestcases.map((item) => ({
              ...item,
              isUserTestcase: false
            })),
            ...userTestcases.map((item) => ({
              ...item,
              isUserTestcase: true
            }))
          ]
        }
      }),
      {
        name: storageKey,
        partialize: (state) => ({ userTestcases: state.userTestcases })
      }
    )
  )
}

type TestcaseStore = ReturnType<typeof createTestcaseStore>

const TestcaseStoreContext = createContext<TestcaseStore | null>(null)

export function TestcaseStoreProvider({
  problemId,
  problemTestcase,
  children
}: {
  problemId: number
  problemTestcase: TestcaseItem[]
  children: ReactNode
}) {
  const storeRef = useRef<TestcaseStore>()
  if (!storeRef.current) {
    storeRef.current = createTestcaseStore(problemId, problemTestcase)
  }

  return (
    <TestcaseStoreContext.Provider value={storeRef.current}>
      {children}
    </TestcaseStoreContext.Provider>
  )
}

export function useTestcaseStore<T>(selector: (state: TestcaseState) => T) {
  const store = useContext(TestcaseStoreContext)

  if (store === null) {
    throw new Error(
      'useTestcaseStore should be used within TestResultStoreProvider'
    )
  }

  return useStore(store, selector)
}
