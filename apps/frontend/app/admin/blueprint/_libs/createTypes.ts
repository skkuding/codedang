import type { BlueprintReadResult } from './types'

export interface BlueprintCreateSection {
  groupId: number
  sectionLabel: string
  title: string
  semester: string | null
  memberCount: number | null
}

export interface BlueprintCreateProblem {
  id: number
  title: string
  level: string
  hasSolution: boolean
}

export interface BlueprintCreateOptions {
  courseTitle: string
  weeks: readonly number[]
  sections: readonly BlueprintCreateSection[]
}

export interface BlueprintDraftProblem {
  problemId: number
  score: number
  solution: 'hidden' | 'after-due' | 'manual'
  manualReleaseTime?: string
  lastVisibleSolution?: 'after-due' | 'manual'
}

export interface BlueprintSectionSchedule {
  groupId: number
  startTime: string
  dueTime: string
  endTime: string
}

export interface BlueprintCreateDraft {
  title: string
  week: number | null
  description: string
  problems: readonly BlueprintDraftProblem[]
  sections: readonly BlueprintSectionSchedule[]
  isJudgeResultVisible: boolean
  enableCopyPaste: boolean
}

export interface BlueprintCreateSource {
  readOptions: (
    blueprintId: number
  ) => Promise<BlueprintReadResult<BlueprintCreateOptions>>
}

export function emptyBlueprintCreateDraft(): BlueprintCreateDraft {
  return {
    title: '',
    week: null,
    description: '',
    problems: [],
    sections: [],
    isJudgeResultVisible: true,
    enableCopyPaste: true
  }
}
