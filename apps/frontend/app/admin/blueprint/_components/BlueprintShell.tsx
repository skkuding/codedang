'use client'

import { cn } from '@/libs/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { blueprintListHref } from '../_libs/routes'
import type {
  BlueprintCourseInformation,
  BlueprintReadState
} from '../_libs/types'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'

interface BlueprintShellProps {
  blueprintId: number
  kind: 'assignment' | 'exercise'
  information: BlueprintReadState<BlueprintCourseInformation> | null
  children: ReactNode
}

const tabs = [
  { kind: 'assignment', name: 'Assignment' },
  { kind: 'exercise', name: 'Exercise' }
] as const

export function BlueprintShell({
  blueprintId,
  kind,
  information,
  children
}: BlueprintShellProps) {
  return (
    <div className="w-full px-6 py-10 lg:pb-[71px] lg:pl-[86px] lg:pr-[106px] lg:pt-[80px]">
      <div className="w-full">
        <header className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-head3_sb_28">
                {kind === 'exercise' ? 'EXERCISE' : 'ASSIGNMENT'}
              </h1>
              <span className="bg-primary text-caption2_m_12 rounded-full px-4 py-1.5 tracking-[-0.36px] text-white">
                Blueprint
              </span>
            </div>
            <Link
              href="/admin/course"
              className="text-body2_m_14 text-color-neutral-50 hover:text-primary rounded-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
            >
              Back to Course List
            </Link>
          </div>
          {information === null ? (
            <p className="text-body1_m_16 text-color-neutral-50" role="status">
              Blueprint information is unavailable.
            </p>
          ) : (
            <BlueprintReadBoundary state={information}>
              {(course) => (
                <p className="text-body1_m_16 text-color-neutral-50 break-words">
                  {[
                    [
                      course.courseCode ? `[${course.courseCode}]` : null,
                      course.title
                    ]
                      .filter(Boolean)
                      .join(' '),
                    course.semester
                  ]
                    .filter(Boolean)
                    .join(' ㆍ ')}
                </p>
              )}
            </BlueprintReadBoundary>
          )}
        </header>

        <nav
          aria-label="Blueprint content"
          className="my-10 flex w-full border-b border-gray-200"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.kind}
              href={blueprintListHref(blueprintId, tab.kind)}
              aria-current={kind === tab.kind ? 'page' : undefined}
              className={cn(
                'text-sub3_sb_16 relative flex h-10 min-w-0 flex-1 items-center justify-center pb-4 transition-colors',
                kind === tab.kind
                  ? 'text-primary after:bg-primary after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-full'
                  : 'text-color-neutral-40 hover:text-color-neutral-70'
              )}
            >
              {tab.name}
            </Link>
          ))}
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="text-sub3_sb_16 text-color-neutral-70 flex h-10 min-w-0 flex-1 cursor-not-allowed items-center justify-center pb-4"
          >
            Notice
          </button>
        </nav>

        <main className="w-full min-w-0">{children}</main>
      </div>
    </div>
  )
}
