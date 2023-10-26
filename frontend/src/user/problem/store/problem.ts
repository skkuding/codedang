import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Language } from '../types'

export interface Problem {
  id: string
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  hint: string
  languages: Language[]
  timeLimit: number
  memoryLimit: number
  difficulty: string
  source: string
  inputExamples: string[]
  outputExamples: string[]
}

type ProblemType = 'problem' | 'contest' | 'workbook'

export const useProblemStore = defineStore('problem', () => {
  const language = ref<Language>()
  const code = ref('')
  const type = ref<ProblemType>()
  const problem = ref<Problem>({
    id: '',
    title: '',
    description: '',
    inputDescription: '',
    outputDescription: '',
    hint: '',
    languages: [],
    timeLimit: 0,
    memoryLimit: 0,
    difficulty: '',
    source: '',
    inputExamples: [],
    outputExamples: []
  })

  const reset = () => {
    code.value = ''
  }

  return {
    code,
    language,
    type,
    problem,
    reset
  }
})
