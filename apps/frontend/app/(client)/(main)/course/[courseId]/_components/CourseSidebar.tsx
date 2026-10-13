'use client'

import { SideBar } from '@/components/SideBar'
import { cn } from '@/libs/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NoticeIcon,
  AssignmentIcon,
  ExerciseIcon,
  QnaIcon
} from '../../../../../../components/Icons'
import { CourseInfoBox } from './CourseInfoBox'

interface CourseSidebarProps {
  courseId: string
}

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Notice',
      path: `/course/${courseId}/notice` as const,
      icon: NoticeIcon
    },
    {
      name: 'Assignment',
      path: `/course/${courseId}/assignment` as const,
      icon: AssignmentIcon
    },
    {
      name: 'Exercise',
      path: `/course/${courseId}/exercise` as const,
      icon: ExerciseIcon
    },
    {
      name: 'Q&A',
      path: `/course/${courseId}/qna` as const,
      icon: QnaIcon
    }
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="fixed z-10 w-full border-b border-gray-200 bg-white px-4 py-3">
          <nav className="flex items-center justify-center">
            {navItems.map((item) => {
              const isActive = pathname.includes(item.path)
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex-1 px-4 py-2 text-center text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <span>{item.name}</span>
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-0.5 transition-colors',
                      isActive ? 'bg-primary' : 'bg-transparent'
                    )}
                  />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="ml-[116px] mt-20 hidden shrink-0 lg:flex">
        <aside
          data-testid="course-sidebar"
          className="flex h-[468px] w-[280px] flex-col gap-5 rounded-xl bg-white px-5 py-10 shadow-[0_4px_20px_rgba(53,78,116,0.10)]"
        >
          <CourseInfoBox courseId={courseId} />
          <nav aria-label="강의 메뉴">
            <SideBar navItems={navItems} isSidebarExpanded />
          </nav>
        </aside>
      </div>
    </>
  )
}
