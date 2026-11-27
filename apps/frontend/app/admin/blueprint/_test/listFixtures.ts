import type {
  BlueprintAssignmentSummary,
  BlueprintListScope
} from '../_libs/types'

export function createTestListFixture(titleSuffix: string): {
  rows: readonly BlueprintAssignmentSummary[]
  scope: BlueprintListScope
} {
  return {
    rows: [
      {
        id: 10,
        title: `Alpha ${titleSuffix}`,
        week: 1,
        isExercise: false,
        assignment: [
          {
            id: 100,
            groupId: 5,
            sectionLabel: 'Section 01',
            startTime: '2026-11-01T00:00:00Z',
            dueTime: null,
            endTime: '2026-11-08T00:00:00Z'
          }
        ]
      },
      {
        id: 11,
        title: `Beta ${titleSuffix}`,
        week: 2,
        isExercise: false,
        assignment: []
      }
    ],
    scope: {
      blueprintCourseId: 1,
      isExercise: false,
      cursor: null,
      take: 10
    }
  }
}
