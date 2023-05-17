import type { Language } from '@prisma/client'

export class JudgeRequestDto {
  code: string
  language: Language
  problemId: number
  timeLimit: number
  memoryLimit: number
  judgeMode: string

  constructor(code, language, problemId, timeLimit, memoryLimit) {
    this.code = code
    this.language = language
    this.problemId = problemId
    this.timeLimit = timeLimit
    this.memoryLimit = memoryLimit
  }
}
