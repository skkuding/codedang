import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Language } from '../types'

export const useProblemStore = defineStore('problem', () => {
  const language = ref<Language>('cpp')

  return {
    language
  }
})
