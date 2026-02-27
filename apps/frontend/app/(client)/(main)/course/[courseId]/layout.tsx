'use client'

import { Cover } from '@/app/(client)/(main)/_components/Cover'
import { useHeaderTitle } from '@/app/(client)/(main)/_contexts/HeaderTitleContext'
import { useTranslate } from '@tolgee/react'
import { useParams } from 'next/navigation'
import React from 'react'
import { CourseSidebar } from './_components/CourseSidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { setHeaderTitle } = useHeaderTitle()
  const { courseId } = useParams()
  const { t } = useTranslate()

  React.useEffect(() => {
    return () => {
      setHeaderTitle(null)
    }
  }, [setHeaderTitle])

  return (
    <>
      <div className="hidden lg:flex">
        <Cover
          title={t('course_title')}
          description={t('course_description')}
        />
      </div>
      <div className="mt-14 flex h-full w-full max-w-[1440px] flex-col lg:mt-0">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <CourseSidebar courseId={courseId as string} />
        </div>

        <div className="flex flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <CourseSidebar courseId={courseId as string} />
          </div>
          <article className="w-full">
            <div>{children}</div>
          </article>
        </div>
      </div>
    </>
  )
}
