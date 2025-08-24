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
  assignmentId?: number,
  exerciseId?: number
) => {
  let languageKey = `${problemId}`

  if (contestId) {
    languageKey += `_contest_${contestId}_language`
  } else if (assignmentId) {
    languageKey += `_course_${courseId}_assignment_${assignmentId}_language`
  } else if (exerciseId) {
    languageKey += `_course_${courseId}_exercise_${exerciseId}_language`
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
}

export const useCodeStore = create<CodeState>((set) => ({
  code: '',
  setCode: (code) => {
    set({ code })
  }
}))

export const getStorageKey = (
  language: Language,
  problemId: number,
  userName: string,
  contestId?: number,
  assignmentId?: number,
  exerciseId?: number
) => {
  if (userName === '') {
    return null
  }

  const key = new URLSearchParams({
    userName,
    language,
    problemId: problemId.toString(),
    contestId: contestId?.toString() ?? '',
    assignmentId: assignmentId?.toString() ?? '',
    exerciseId: exerciseId?.toString() ?? ''
  }).toString()

  return `code_${key}`
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
