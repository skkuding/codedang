import type { Language } from '@/types/type'
import { createContext } from 'react'
import { create, createStore } from 'zustand'
import { persist } from 'zustand/middleware'

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
interface CodeState {
  code: string
  setCode: (code: string) => void
}

type CodeStore = ReturnType<typeof createCodeStore>

export const createCodeStore = (
  language: Language,
  problemId: number,
  contestId?: number
) => {
  const problemKey = `${problemId}${contestId ? `_${contestId}` : ''}_${language}`
  return createStore<CodeState>()(
    persist<CodeState>(
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
  )
}

export const CodeContext = createContext<CodeStore | null>(null)
