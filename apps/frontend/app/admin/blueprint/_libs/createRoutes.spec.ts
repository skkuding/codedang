import { describe, expect, it } from 'vitest'
import { blueprintCreateHref } from './routes'

describe('Blueprint create URLs', () => {
  it.each(['assignment', 'exercise'] as const)(
    'carries the originating page into the new static create route: %s',
    (kind) => {
      expect(
        blueprintCreateHref(51, kind, { cursor: 190, take: 2, page: 2 })
      ).toBe(`/admin/blueprint/51/${kind}/create?cursor=190&take=2&page=2`)
    }
  )

  it('omits default page parameters', () => {
    expect(
      blueprintCreateHref(51, 'assignment', { cursor: null, take: 10, page: 1 })
    ).toBe('/admin/blueprint/51/assignment/create')
  })
})
