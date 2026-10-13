import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CourseSidebar } from './CourseSidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/course/1/qna'
}))

vi.mock('./CourseInfoBox', () => ({
  CourseInfoBox: () => <div>Course info</div>
}))

afterEach(cleanup)

describe('CourseSidebar', () => {
  it('강의 메뉴 링크와 피그마 규격의 데스크톱 카드를 렌더링한다', () => {
    render(<CourseSidebar courseId="1" />)

    const sidebar = screen.getByTestId('course-sidebar')
    const desktopNav = screen.getByRole('navigation', { name: '강의 메뉴' })
    const activeLink = desktopNav.querySelector('a[aria-current="page"]')

    expect(sidebar.className).toContain('h-[468px]')
    expect(sidebar.className).toContain('w-[280px]')
    expect(desktopNav.querySelectorAll('a')).toHaveLength(4)
    expect(activeLink?.textContent).toBe('Q&A')
    expect(activeLink?.getAttribute('href')).toBe('/course/1/qna')
  })
})
