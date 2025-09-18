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

/**
 * Creates a store for managing test cases related to a specific problem.
 *
 * @param problemId - The ID of the problem.
 * @param sampleTestcases - An array of sample test cases.
 * @param contestId - (Optional) The ID of the contest.
 * @param assignmentId - (Optional) The ID of the assignment.
 * @param courseId - (Optional) The ID of the course.
 * @returns A store for managing test cases.
 *
 * The storage key is generated based on the provided IDs:
 * - If `contestId` is provided: `user_testcase_{problemId}_{contestId}`
 * - If `assignmentId` is provided: `user_testcase_{problemId}_{courseId}_{assignmentId}`
 * - Otherwise: `user_testcase_{problemId}`
 *
 * Example keys:
 * - Contest: `user_testcase_1_2`
 * - Assignment: `user_testcase_1_2_3`
 * - Problem only: `user_testcase_1`
 */
const createTestcaseStore = (
  problemId: number,
  sampleTestcases: TestcaseItem[],
  contestId?: number,
  assignmentId?: number,
  exerciseId?: number,
  courseId?: number
) => {
  const baseKey = `user_testcase_${problemId}`
  let storageKey = ''
  if (contestId) {
    storageKey = `${baseKey}_${contestId}`
  } else if (assignmentId) {
    storageKey = `${baseKey}_${courseId}_${assignmentId}`
  } else if (exerciseId) {
    storageKey = `${baseKey}_${courseId}_${exerciseId}`
  } else {
    storageKey = baseKey
  }

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

interface TestcaseStoreProviderProps {
  problemId: number
  contestId?: number
  courseId?: number
  assignmentId?: number
  exerciseId?: number
  problemTestcase: TestcaseItem[]
  children: ReactNode
}

export function TestcaseStoreProvider({
  problemId,
  contestId,
  courseId,
  assignmentId,
  exerciseId,
  problemTestcase,
  children
}: TestcaseStoreProviderProps) {
  const storeRef = useRef<TestcaseStore>(undefined)
  if (!storeRef.current) {
    storeRef.current = createTestcaseStore(
      problemId,
      problemTestcase,
      contestId,
      assignmentId,
      exerciseId,
      courseId
    )
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
