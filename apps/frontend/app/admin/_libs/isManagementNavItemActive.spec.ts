import { describe, expect, it } from 'vitest'
import { isManagementNavItemActive } from './isManagementNavItemActive'

const menuPaths = [
  '/admin',
  '/admin/user',
  '/admin/notice',
  '/admin/problem',
  '/admin/course',
  '/admin/contest'
]

const activeMenuPaths = (pathname: string) =>
  menuPaths.filter((itemPath) => isManagementNavItemActive(pathname, itemPath))

describe('Management sidebar active menu', () => {
  it.each([
    '/admin/blueprint',
    '/admin/blueprint/',
    '/admin/blueprint/72',
    '/admin/blueprint/72/assignment',
    '/admin/blueprint/72/assignment/91',
    '/admin/blueprint/72/exercise',
    '/admin/blueprint/72/exercise/92',
    '/admin/blueprint/72/future/child'
  ])('selects only Course on Blueprint routes: %s', (pathname) => {
    expect(activeMenuPaths(pathname)).toEqual(['/admin/course'])
  })

  it.each([
    '/admin/blueprints',
    '/admin/blueprints/72/assignment',
    '/admin/blueprint-copy',
    '/admin/blueprint72'
  ])('does not treat similar prefixes as Blueprint routes: %s', (pathname) => {
    expect(activeMenuPaths(pathname)).toEqual([])
  })

  it.each([
    '/admin/course',
    '/admin/course/72',
    '/admin/course/72/assignment',
    '/admin/course/72/assignment/91',
    '/admin/course/72/exercise/92'
  ])('keeps Course selected on general Course routes: %s', (pathname) => {
    expect(activeMenuPaths(pathname)).toEqual(['/admin/course'])
  })

  it.each([
    ['/admin', '/admin'],
    ['/admin/user', '/admin/user'],
    ['/admin/user/12', '/admin/user'],
    ['/admin/notice/12', '/admin/notice'],
    ['/admin/problem/12', '/admin/problem'],
    ['/admin/contest/12/assignment', '/admin/contest']
  ])('keeps the existing menu selection for %s', (pathname, activePath) => {
    expect(activeMenuPaths(pathname)).toEqual([activePath])
  })

  it.each(['/admin/', '/admin/unknown', '/admin/blueprints', '/'])(
    'does not select Dashboard outside its exact route: %s',
    (pathname) => {
      expect(isManagementNavItemActive(pathname, '/admin')).toBe(false)
    }
  )
})
