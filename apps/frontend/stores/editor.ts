import type { Language, TestResult } from '@/types/type'
import { createContext } from 'react'
import { create, createStore } from 'zustand'
import { persist } from 'zustand/middleware'

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = (problemId: number, contestId?: number) => {
  const languageKey = `${problemId}${contestId ? `_${contestId}` : ''}_language`
  return create(
    persist<LanguageStore>(
      (set) => ({
        language: 'C',
        setLanguage: (language) => {
          set({ language })
        }
      }),
      {
        name: languageKey
      }
    )
  )
}
interface CodeState {
  code: string
  setCode: (code: string) => void
}

export const createCodeStore = create<CodeState>((set) => ({
  code: '',
  setCode: (code) => {
    set({ code })
  }
}))

export const getKey = (
  language: Language,
  problemId: number,
  userName: string,
  contestId?: number
) => {
  if (userName === '') return undefined
  const problemKey = `${userName}_${problemId}${contestId ? `_${contestId}` : ''}_${language}`
  return problemKey
}

export const getItem = (name: string) => {
  const str = localStorage.getItem(name)
  if (!str) return null
  return str
}

export const setItem = (name: string, value: string) => {
  localStorage.setItem(name, JSON.stringify(value))
}

export const removeItem = (name: string) => localStorage.removeItem(name)

interface TestResultsState {
  testResults: TestResult[]
  setTestResults: (results: TestResult[]) => void
}

type TestResultsStore = ReturnType<typeof createTestResultsStore>

export const createTestResultsStore = (
  problemId: number,
  contestId?: number
) => {
  const problemKey = `${problemId}${contestId ? `_${contestId}` : ''}_test_results`
  return createStore<TestResultsState>()(
    persist<TestResultsState>(
      (set) => ({
        testResults: [],
        setTestResults: (results) => {
          set({ testResults: results })
        }
      }),
      {
        name: problemKey
      }
    )
  )
}

export const TestResultsContext = createContext<TestResultsStore | null>(null)
