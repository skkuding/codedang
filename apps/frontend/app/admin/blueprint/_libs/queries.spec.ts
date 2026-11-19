import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { blueprintNoticeKeys } from './noticeQueries'
import { blueprintKeys } from './queries'

describe('Blueprint read cache scope', () => {
  it('separates courses, content kinds, cursors, page sizes and master details', () => {
    const client = new QueryClient()
    const scope = {
      blueprintCourseId: 42,
      isExercise: false,
      cursor: null,
      take: 10
    }
    const originalKey = blueprintKeys.assignments(scope)
    client.setQueryData(originalKey, ['master assignment'])

    const differentScopes = [
      { ...scope, blueprintCourseId: 43 },
      { ...scope, isExercise: true },
      { ...scope, cursor: 10 },
      { ...scope, take: 20 }
    ]
    for (const otherScope of differentScopes) {
      expect(
        client.getQueryData(blueprintKeys.assignments(otherScope))
      ).toBeUndefined()
    }
    expect(
      client.getQueryData(blueprintKeys.assignment(42, 42))
    ).toBeUndefined()
    expect(client.getQueryData(['assignment', 42, 42])).toBeUndefined()
    expect(client.getQueryData(originalKey)).toEqual(['master assignment'])
  })

  it('can invalidate one Blueprint without invalidating another or Course data', async () => {
    const client = new QueryClient()
    const blueprintKey = blueprintKeys.assignment(42, 10)
    const otherBlueprintKey = blueprintKeys.assignment(43, 10)
    const courseKey = ['assignment', 42, 10]
    for (const key of [blueprintKey, otherBlueprintKey, courseKey]) {
      client.setQueryData(key, { title: 'content' })
    }

    await client.invalidateQueries({ queryKey: blueprintKeys.course(42) })

    expect(client.getQueryState(blueprintKey)?.isInvalidated).toBe(true)
    expect(client.getQueryState(otherBlueprintKey)?.isInvalidated).toBe(false)
    expect(client.getQueryState(courseKey)?.isInvalidated).toBe(false)
  })

  it('isolates Notice pages, options and edit data from Assignment/Exercise caches', () => {
    const client = new QueryClient()
    const scope = {
      kind: 'notice' as const,
      blueprintCourseId: 42,
      cursor: null,
      take: 10,
      page: 1
    }
    client.setQueryData(blueprintNoticeKeys.list(scope), ['notice'])
    client.setQueryData(blueprintNoticeKeys.detail(42, 10), { title: 'notice' })
    const otherKeys = [
      blueprintNoticeKeys.list({ ...scope, blueprintCourseId: 43 }),
      blueprintNoticeKeys.list({ ...scope, cursor: 10, page: 2 }),
      blueprintNoticeKeys.list({ ...scope, take: 20 }),
      blueprintNoticeKeys.options(42),
      blueprintNoticeKeys.detail(43, 10),
      blueprintKeys.assignment(42, 10),
      ...[false, true].map((isExercise) =>
        blueprintKeys.assignments({ ...scope, isExercise })
      )
    ]
    for (const key of otherKeys) {
      expect(client.getQueryData(key)).toBeUndefined()
    }
    client.clear()
  })
})
