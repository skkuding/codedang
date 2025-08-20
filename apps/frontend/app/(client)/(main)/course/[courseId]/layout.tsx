'use client'

import { Cover } from '@/app/(client)/(main)/_components/Cover'
import { useHeaderTitle } from '@/app/(client)/(main)/_contexts/HeaderTitleContext'
import React from 'react'
import { CourseSidebar } from './_components/CourseSidebar'

interface CourseLayoutProps {
  children: React.ReactNode
  params: {
    courseId: string
  }
}

export default function Layout(props: CourseLayoutProps) {
  const { children, params } = props
  const { setHeaderTitle } = useHeaderTitle()

  React.useEffect(() => {
    return () => {
      setHeaderTitle(null)
    }
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
          <CourseSidebar courseId={params.courseId} />
        </div>

        <div className="flex flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <CourseSidebar courseId={params.courseId} />
          </div>
          <article className="w-full">
            <div>{children}</div>
          </article>
        </div>
      </div>
    </>
  )
}
