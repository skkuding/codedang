import type { Language } from '@prisma/client'

export class CheckRequestMsg {
  problemId: number
  language: Language
  enableMerging: boolean
  useJplagClustering: boolean
  minTokens: number
  assignmentIds: number[]
  contestId: number | null
  workbookId: number | null

  constructor(
    problemId: number,
    language: Language,
    minTokens: number,
    enableMerging = false,
    useJplagClustering = true,
    assignmentIds?: number[],
    contestId?: number,
    workbookId?: number
  ) {
    this.problemId = problemId
    this.language = language
    this.minTokens = minTokens
    this.enableMerging = enableMerging
    this.useJplagClustering = useJplagClustering
    this.assignmentIds = assignmentIds ?? []
    this.contestId = contestId !== undefined ? contestId : null
    this.workbookId = workbookId !== undefined ? workbookId : null
  }
}
