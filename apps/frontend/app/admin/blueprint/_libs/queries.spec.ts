import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
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
})
