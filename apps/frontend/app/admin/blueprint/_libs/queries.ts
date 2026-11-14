import type { BlueprintListScope } from './types'

export const blueprintKeys = {
  course: (blueprintCourseId: number) =>
    ['blueprint', blueprintCourseId] as const,
  assignments: (scope: BlueprintListScope) =>
    [
      ...blueprintKeys.course(scope.blueprintCourseId),
      'assignments',
      { isExercise: scope.isExercise, cursor: scope.cursor, take: scope.take }
    ] as const,
  assignment: (blueprintCourseId: number, blueprintAssignmentId: number) =>
    [
      ...blueprintKeys.course(blueprintCourseId),
      'assignment',
      blueprintAssignmentId
    ] as const
}
