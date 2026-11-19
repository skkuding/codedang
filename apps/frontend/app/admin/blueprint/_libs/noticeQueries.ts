import type { BlueprintNoticeScope } from './noticeTypes'

export const blueprintNoticeKeys = {
  list: (scope: BlueprintNoticeScope) =>
    [
      'blueprint',
      scope.blueprintCourseId,
      'notices',
      scope.cursor,
      scope.take,
      scope.page
    ] as const,
  options: (blueprintId: number) =>
    ['blueprint', blueprintId, 'notice-options'] as const,
  detail: (blueprintId: number, noticeId: number) =>
    ['blueprint', blueprintId, 'notice', noticeId] as const
}
