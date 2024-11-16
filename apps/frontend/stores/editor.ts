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
  const parsed = storedCode.replaceAll('"', '')
  localStorage.setItem(key, parsed)

  return parsed
}
