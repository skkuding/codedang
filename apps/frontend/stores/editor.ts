import type { Language } from '@/types/type'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = (
  problemId: number,
  contestId?: number,
  courseId?: number,
  assignmentId?: number
) => {
  let languageKey = `${problemId}`

  if (contestId) {
    languageKey += `_contest_${contestId}_language`
  } else if (assignmentId) {
    languageKey += `_course_${courseId}_assignment_${assignmentId}_language`
  } else {
    languageKey += '_language'
  }

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
  contestId?: number,
  courseId?: number,
  assignmentId?: number
) => {
  if (userName === '') {
    return undefined
  }

  let problemKey = `${userName}_${problemId}`

  if (contestId) {
    problemKey += `_contest_${contestId}_language`
  } else if (assignmentId) {
    problemKey += `_course_${courseId}_assignment_${assignmentId}_language`
  } else {
    problemKey += '_language'
  }
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
