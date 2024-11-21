import type { Language } from '@/types/type'
import { create } from 'zustand'
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

interface SubsmissionResult {
  problemId: number
  result: string
}
interface SubsmissionResultState {
  submissionResult: SubsmissionResult[]
  setSubmissionResult: (problemId: number, result: string) => void
  getSubmissionResult: () => SubsmissionResult[]
  setSubmissionResultToLocalStorage: (
    contestId: number,
    problemId: number,
    result: SubsmissionResult[]
  ) => void
  getSubmissionResultFromLocalStorage: (
    contestId: number,
    problemId: number
  ) => SubsmissionResult[]
}

export const useSubsmissionResultStore = create<SubsmissionResultState>(
  (set, get) => ({
    submissionResult: [],
    setSubmissionResult: (problemId, result) =>
      set((prev) => {
        const exist = prev.submissionResult.find(
          (item) => item.problemId === problemId
        )
        if (!exist || exist.result !== 'Accepted') {
          return {
            submissionResult: [...prev.submissionResult, { problemId, result }]
          }
        }
        return {}
      }),
    getSubmissionResult: () => get().submissionResult,
    setSubmissionResultToLocalStorage: (contestId, problemId, result) =>
      localStorage.setItem(
        `${contestId}_${problemId}_result`,
        JSON.stringify(result)
      ),
    getSubmissionResultFromLocalStorage: (contestId, problemId) => {
      const storedResult = localStorage.getItem(
        `${contestId}_${problemId}_result`
      )
      if (storedResult) return JSON.parse(storedResult)
      else return []
    }
  })
)

interface CodeState {
  code: string
  setCode: (code: string) => void
  getCode: () => string
}

export const useCodeStore = create<CodeState>((set, get) => ({
  code: '',
  setCode: (code) => {
    set({ code })
  },
  getCode: () => get().code
}))

export const getStorageKey = (
  language: Language,
  problemId: number,
  userName: string,
  contestId?: number
) => {
  if (userName === '') return undefined
  const problemKey = `${userName}_${problemId}${contestId ? `_${contestId}` : ''}_${language}`
  return problemKey
}

export const getCodeFromLocalStorage = (key: string) => {
  const storedCode = localStorage.getItem(key) ?? ''

  try {
    const parsed = JSON.parse(storedCode)
    localStorage.setItem(key, parsed)
    return parsed
  } catch {
    return storedCode
  }
}
