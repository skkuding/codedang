import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CourseSidebar } from './CourseSidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/course/1/qna'
}))

vi.mock('next/link', () => ({
  default: ({ children, ...props }: ComponentProps<'a'>) => (
    <a {...props}>{children}</a>
  )
}))

vi.mock('./CourseInfoBox', () => ({
  CourseInfoBox: () => <div>Course info</div>
}))

// SVGR 아이콘은 vitest에서 URL 문자열로 로드되므로 컴포넌트로 대체
vi.mock('@/public/icons/notice.svg', () => ({ default: () => <svg /> }))
vi.mock('@/public/icons/assignment.svg', () => ({ default: () => <svg /> }))
vi.mock('@/public/icons/exercise.svg', () => ({ default: () => <svg /> }))
vi.mock('@/public/icons/qna.svg', () => ({ default: () => <svg /> }))

afterEach(cleanup)

describe('CourseSidebar', () => {
  it('강의 메뉴 링크를 렌더링하고 현재 경로의 메뉴를 활성화한다', () => {
    render(<CourseSidebar courseId="1" />)

    const desktopNav = screen.getByRole('navigation', { name: '강의 메뉴' })
    const activeLink = desktopNav.querySelector('a[aria-current="page"]')

    expect(desktopNav.querySelectorAll('a')).toHaveLength(4)
    expect(activeLink?.textContent).toBe('Q&A')
    expect(activeLink?.getAttribute('href')).toBe('/course/1/qna')
  })
})
