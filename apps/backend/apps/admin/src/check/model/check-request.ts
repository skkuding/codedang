import type { Language } from '@prisma/client'

export class CheckRequestMsg {
  problemId: number
  language: Language
  checkPreviousSubmission: boolean
  enableMerging: boolean
  useJplagClustering: boolean
  minTokens: number
  assignmentId: number | null
  contestId: number | null
  workbookId: number | null

  constructor(
    problemId: number,
    language: Language,
    minTokens: number,
    checkPreviousSubmission = true,
    enableMerging = false,
    useJplagClustering = true,
    assignmentId?: number,
    contestId?: number,
    workbookId?: number
  ) {
    this.problemId = problemId
    this.language = language
    this.minTokens = minTokens
    this.checkPreviousSubmission = checkPreviousSubmission
    this.enableMerging = enableMerging
    this.useJplagClustering = useJplagClustering
    this.assignmentId = assignmentId !== undefined ? assignmentId : null
    this.contestId = contestId !== undefined ? contestId : null
    this.workbookId = workbookId !== undefined ? workbookId : null
  }
}
