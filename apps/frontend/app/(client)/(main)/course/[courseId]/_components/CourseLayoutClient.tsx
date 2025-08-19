'use client'

import { Cover } from '@/app/(client)/(main)/_components/Cover'
import { useHeaderTitle } from '@/app/(client)/(main)/_contexts/HeaderTitleContext'
import React from 'react'
import { CourseSidebar } from './CourseSidebar'

interface CourseLayoutClientProps {
  courseId: string
  children: React.ReactNode
}

export function CourseLayoutClient({
  courseId,
  children
}: CourseLayoutClientProps) {
  const { setHeaderTitle } = useHeaderTitle()

  // Course 페이지를 벗어날 때 Context 초기화
  React.useEffect(() => {
    return () => setHeaderTitle(null) // 컴포넌트 언마운트 시 초기화
  }, [setHeaderTitle])

  return (
    <>
      <div className="hidden lg:flex">
        <Cover
          title="COURSE"
          description="Structured Learning, Real-World Coding"
        />
      </div>
      <div className="mt-14 flex h-full w-full max-w-[1440px] flex-col lg:mt-0">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <CourseSidebar courseId={courseId} />
        </div>

        <div className="flex flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <CourseSidebar courseId={courseId} />
          </div>
          <article className="w-full">
            <div>{children}</div>
          </article>
        </div>
      </div>
    </>
  )
}
