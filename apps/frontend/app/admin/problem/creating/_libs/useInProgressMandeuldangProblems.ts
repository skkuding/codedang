import type { MandeuldangRole } from '../../mandeuldang/_libs/permissions'

export const CHECKLIST_TOTAL = 4

export type InProgressProblemStatus = 'Draft' | 'Ready'

export interface InProgressMandeuldangProblem {
  id: number
  title: string
  status: InProgressProblemStatus
  myRole: MandeuldangRole | null
  updateTime: string
  checklistProgress: number | null
  collaboratorCount: number | null
}

// TODO: getInProgressMandeuldangProblems API 연동 후 mock 제거
const mockProblems: InProgressMandeuldangProblem[] = [
  {
    id: 1,
    title: '최단 경로 찾기',
    status: 'Draft',
    myRole: 'Owner',
    updateTime: '2026-10-29T09:12:00.000Z',
    checklistProgress: 2,
    collaboratorCount: 3
  },
  {
    id: 2,
    title: '정수 더하기',
    status: 'Ready',
    myRole: 'Owner',
    updateTime: '2026-10-27T14:30:00.000Z',
    checklistProgress: 4,
    collaboratorCount: 1
  },
  {
    id: 3,
    title: '괄호 문자열 검사',
    status: 'Draft',
    myRole: 'Editor',
    updateTime: '2026-10-25T03:45:00.000Z',
    checklistProgress: 1,
    collaboratorCount: 2
  },
  {
    id: 4,
    title: '트리의 지름',
    status: 'Draft',
    myRole: 'Reviewer',
    updateTime: '2026-10-20T11:00:00.000Z',
    checklistProgress: null,
    collaboratorCount: null
  }
]

export function useInProgressMandeuldangProblems() {
  return mockProblems
}
