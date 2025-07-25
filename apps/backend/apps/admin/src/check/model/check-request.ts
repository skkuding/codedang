import type { Language } from '@prisma/client'

export class CheckRequest {
  checkId: string
  problemId: number
  language: Language
  checkPreviousSubmission: boolean
  enableMerging: boolean
  useJplagClustering: boolean
  minTokens: number

  constructor(
    checkId: string,
    problemId: number,
    language: Language,
    minTokens: number,
    checkPreviousSubmission = true,
    enableMerging = false,
    useJplagClustering = true
  ) {
    this.checkId = checkId
    this.problemId = problemId
    this.language = language
    this.minTokens = minTokens
    this.checkPreviousSubmission = checkPreviousSubmission
    this.enableMerging = enableMerging
    this.useJplagClustering = useJplagClustering
  }
}
