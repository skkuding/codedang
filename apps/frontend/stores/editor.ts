import type { Language } from '@/types/type'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CodeStore {
  code: string
  setCode: (code: string) => void
}

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create(
  persist<LanguageStore>(
    (set) => ({
      language: 'C',
      setLanguage: (language) => {
        set({ language })
      }
    }),
    {
      name: 'language'
    }
  )
)

export const useCodeStore = (
  language: Language,
  problemId: string | number,
  contestId?: string | number
) => {
  const problemKey = `${problemId}${contestId ? `_${contestId}` : ''}_${language}`
  return create(
    persist<CodeStore>(
      (set) => ({
        code: '',
        setCode: (code) => {
          set({ code })
        }
      }),
      {
        name: problemKey
      }
    )
  )()
}
