import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Language } from '../types'

export const useProblemStore = defineStore('problem', () => {
  const language = ref<Language>('Cpp')
  const code = ref('')

  const reset = () => {
    code.value = ''
  }

  return {
    code,
    language,
    reset
  }
})
