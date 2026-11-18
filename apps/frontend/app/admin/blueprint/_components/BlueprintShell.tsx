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
  detail?: boolean
}

const tabs = [
  { kind: 'assignment', name: 'Assignment' },
  { kind: 'exercise', name: 'Exercise' }
] as const

export function BlueprintShell({
  blueprintId,
  kind,
  information,
  children,
  detail = false
}: BlueprintShellProps) {
  return (
    <div
      className={cn(
        'w-full px-6 py-10',
        detail
          ? 'lg:pb-16 lg:pl-[55px] lg:pr-[68px] lg:pt-16'
          : 'lg:pb-[71px] lg:pl-[86px] lg:pr-[106px] lg:pt-[80px]'
      )}
    >
      <div className="w-full">
        {!detail && (
          <>
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
              <BlueprintCourseMetadata information={information} />
            </header>
            <BlueprintContentTabs blueprintId={blueprintId} kind={kind} />
          </>
        )}

        <main className="w-full min-w-0">{children}</main>
      </div>
    </div>
  )
}

export function BlueprintContentTabs({
  blueprintId,
  kind,
  detail = false
}: {
  blueprintId: number
  kind: 'assignment' | 'exercise'
  detail?: boolean
}) {
  return (
    <nav
      aria-label="Blueprint content"
      className={cn(
        'flex w-full border-b border-gray-200',
        detail ? 'mb-[15px] mt-[46px]' : 'my-10'
      )}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.kind}
          href={blueprintListHref(blueprintId, tab.kind)}
          aria-current={kind === tab.kind ? 'page' : undefined}
          className={cn(
            'text-sub3_sb_16 relative flex h-10 min-w-0 flex-1 items-center justify-center pb-4 transition-colors',
            detail && 'h-[55px] text-[18px] leading-[1.4] tracking-[-0.54px]',
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
        className={cn(
          'text-sub3_sb_16 text-color-neutral-70 flex h-10 min-w-0 flex-1 cursor-not-allowed items-center justify-center pb-4',
          detail && 'h-[55px] text-[18px] leading-[1.4] tracking-[-0.54px]'
        )}
      >
        Notice
      </button>
    </nav>
  )
}

export function BlueprintCourseMetadata({
  information,
  detail = false
}: {
  information: BlueprintReadState<BlueprintCourseInformation> | null
  detail?: boolean
}) {
  const className = cn(
    'min-w-0 break-words',
    detail
      ? 'text-sub2_m_18 text-color-neutral-70 tracking-[-0.54px]'
      : 'text-body1_m_16 text-color-neutral-50'
  )
  if (information === null) {
    return (
      <p className={className} role="status">
        Blueprint information is unavailable.
      </p>
    )
  }
  return (
    <BlueprintReadBoundary state={information}>
      {(course) => (
        <p className={className}>
          {[
            [course.courseCode ? `[${course.courseCode}]` : null, course.title]
              .filter(Boolean)
              .join(' '),
            course.semester
          ]
            .filter(Boolean)
            .join(' ㆍ ')}
        </p>
      )}
    </BlueprintReadBoundary>
  )
}
