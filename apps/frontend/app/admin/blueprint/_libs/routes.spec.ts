import { describe, expect, it } from 'vitest'
import {
  blueprintBaseHref,
  blueprintDetailHref,
  blueprintKind,
  blueprintListHref,
  blueprintListLocation,
  blueprintScope,
  parseBlueprintId
} from './routes'

describe('Blueprint route identifiers', () => {
  it('accepts positive safe integer identifiers', () => {
    expect(parseBlueprintId('51')).toBe(51)
    expect(parseBlueprintId('1')).toBe(1)
  })

  it.each(['', '0', '-1', '1.5', '01', '1e3', ' 51', '9007199254740992'])(
    'rejects malformed or unsafe identifiers: %s',
    (value) => {
      expect(parseBlueprintId(value)).toBeNull()
    }
  )
})

describe('Blueprint list and master URLs', () => {
  it('uses a separate Blueprint namespace and omits default list parameters', () => {
    expect(blueprintBaseHref(51)).toBe('/admin/blueprint/51')
    expect(blueprintListHref(51, 'assignment')).toBe(
      '/admin/blueprint/51/assignment'
    )
    expect(
      blueprintListHref(51, 'exercise', { cursor: null, take: 10, page: 1 })
    ).toBe('/admin/blueprint/51/exercise')
  })

  it.each(['assignment', 'exercise'] as const)(
    'preserves the same list context on master navigation and return: %s',
    (kind) => {
      const input = new URLSearchParams({
        cursor: '81',
        take: '20',
        page: '3',
        search: 'local filter',
        redirectUrl: '/unrelated',
        unknown: 'ignored'
      })
      const location = blueprintListLocation(input)
      const list = new URL(
        blueprintListHref(51, kind, location),
        'https://test.com'
      )
      const detail = new URL(
        blueprintDetailHref(51, kind, 91, location),
        'https://test.com'
      )

      expect(list.pathname).toBe(`/admin/blueprint/51/${kind}`)
      expect(detail.pathname).toBe(`/admin/blueprint/51/${kind}/91`)
      expect(detail.search).toBe(list.search)
      expect(Object.fromEntries(list.searchParams)).toEqual({
        cursor: '81',
        take: '20',
        page: '3'
      })
      expect(blueprintListLocation(detail.searchParams)).toEqual(location)
    }
  )

  it('uses a stable first-page context for missing or malformed paging values', () => {
    const defaults = { cursor: null, take: 10, page: 1 }
    expect(blueprintListLocation(new URLSearchParams())).toEqual(defaults)
    expect(
      blueprintListLocation(new URLSearchParams('cursor=-3&take=0&page=1.5'))
    ).toEqual(defaults)
  })

  it('identifies the selected kind on both list and master routes', () => {
    expect(blueprintKind('/admin/blueprint/51')).toBe('assignment')
    expect(blueprintKind('/admin/blueprint/51/assignment/91')).toBe(
      'assignment'
    )
    expect(blueprintKind('/admin/blueprint/51/exercise')).toBe('exercise')
    expect(blueprintKind('/admin/blueprint/51/exercise/92')).toBe('exercise')
  })

  it('carries Blueprint, kind and page identity into list state ownership', () => {
    const location = { cursor: 81, take: 20, page: 3 }
    const scope = blueprintScope(51, 'assignment', location)

    expect(scope).toEqual({
      blueprintCourseId: 51,
      isExercise: false,
      cursor: 81,
      take: 20,
      page: 3
    })
    expect(blueprintScope(51, 'exercise', location).isExercise).toBe(true)
    expect(blueprintScope(52, 'assignment', location)).not.toEqual(scope)
    expect(
      blueprintScope(51, 'assignment', { ...location, page: 4 })
    ).not.toEqual(scope)
  })
})
