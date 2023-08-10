import type { Language } from '@prisma/client'
import { calculateMemoryLimit, calculateTimeLimit } from '@libs/constants'
import type { Snippet } from './create-submission.dto'

export class JudgeRequest {
  code: string
  language: Language
  problemId: number
  timeLimit: number
  memoryLimit: number
  judgeMode: string

  constructor(
    code: Snippet[],
    language: Language,
    problem: { id: number; timeLimit: number; memoryLimit: number }
  ) {
    this.code = code.map((snippet) => snippet.text).join('\n')
    this.language = language
    this.problemId = problem.id
    this.timeLimit = calculateTimeLimit(language, problem.timeLimit)
    this.memoryLimit = calculateMemoryLimit(language, problem.memoryLimit)
  }
}
