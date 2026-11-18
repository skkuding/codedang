'use client'

import { cn } from '@/libs/utils'
import BackIcon from '@/public/icons/blueprint-create-back.svg'
import type { Route } from 'next'
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
  creation?: boolean
  editing?: boolean
  listHref?: Route
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
  creation = false,
  editing = false,
  listHref,
  children,
  detail = false
}: BlueprintShellProps) {
  const formPage = creation || editing
  let headerInformation: ReactNode
  if (formPage) {
    headerInformation = (
      <p className="text-body2_m_14 text-color-cool-neutral-60 mt-1 pl-10 tracking-[-0.42px]">
        {editing
          ? '연결된 분반의 콘텐츠와 일정을 검토하고 수정합니다.'
          : '저장 시 선택한 분반에 콘텐츠가 생성되고 연결됩니다.'}
      </p>
    )
  } else {
    headerInformation = <BlueprintCourseMetadata information={information} />
  }
  return (
    <div
      className={cn(
        'w-full px-6 py-10 lg:pb-[71px] lg:pl-[86px] lg:pr-[106px] lg:pt-[80px]',
        detail && !formPage && 'lg:pb-16 lg:pl-[55px] lg:pr-[68px] lg:pt-16',
        formPage && 'lg:pb-[100px] lg:pl-16 lg:pr-[116px] lg:pt-[80px]'
      )}
    >
      <div className={cn('w-full', formPage && 'max-w-[1000px]')}>
        {(!detail || formPage) && (
          <>
            <header className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div
                  className={cn(
                    'flex items-center gap-2',
                    formPage && 'flex-wrap'
                  )}
                >
                  {formPage && (
                    <Link
                      href={listHref ?? blueprintListHref(blueprintId, kind)}
                      aria-label={
                        editing
                          ? 'Back to Master Information'
                          : `Back to ${kind === 'exercise' ? 'Exercises' : 'Assignments'}`
                      }
                      className="shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2"
                    >
                      <BackIcon aria-hidden="true" />
                    </Link>
                  )}
                  <h1
                    className={
                      formPage ? 'text-head2_b_32' : 'text-head3_sb_28'
                    }
                  >
                    {editing && 'EDIT '}
                    {creation && !editing && 'CREATE '}
                    {kind === 'exercise' ? 'EXERCISE' : 'ASSIGNMENT'}
                  </h1>
                  <span className="bg-primary text-caption2_m_12 rounded-full px-4 py-1.5 tracking-[-0.36px] text-white">
                    Blueprint
                  </span>
                </div>
                {!formPage && (
                  <Link
                    href="/admin/course"
                    className="text-body2_m_14 text-color-neutral-50 hover:text-primary rounded-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
                  >
                    Back to Course List
                  </Link>
                )}
              </div>
              {headerInformation}
            </header>
            {!formPage && (
              <BlueprintContentTabs blueprintId={blueprintId} kind={kind} />
            )}
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
