'use client'

import { KatexContent } from '@/components/KatexContent'
import { Button } from '@/components/shadcn/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn, convertToLetter } from '@/libs/utils'
import BackIcon from '@/public/icons/blueprint-detail-back.svg'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type {
  BlueprintAssignmentDetail as Detail,
  BlueprintCourseInformation,
  BlueprintReadState
} from '../_libs/types'
import { BlueprintAssignmentSections } from './BlueprintAssignmentSections'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'
import { BlueprintCourseMetadata } from './BlueprintShell'

const settings = [
  ['isVisible', 'Visible'],
  ['isRankVisible', 'Show Rankings'],
  ['isJudgeResultVisible', 'Reveal Hidden Testcase Result'],
  ['enableCopyPaste', 'Enable Copy/Paste'],
  ['autoFinalizeScore', 'Auto Finalize Score']
] as const

function settingValue(value: boolean | null) {
  if (value === null) {
    return 'Unavailable'
  }
  return value ? 'ON' : 'OFF'
}

export function BlueprintAssignmentDetail({
  state,
  isExercise,
  onBack,
  information,
  navigation
}: {
  state: BlueprintReadState<Detail>
  isExercise: boolean
  onBack: () => void
  information?: BlueprintReadState<BlueprintCourseInformation> | null
  navigation?: ReactNode
}) {
  const checkedState: BlueprintReadState<Detail> =
    state.status === 'success' && state.data.isExercise !== isExercise
      ? { status: 'not-found' }
      : state

  return (
    <div className="flex flex-col gap-6">
      {(isExercise || checkedState.status !== 'success') && (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={onBack}
        >
          Back to {isExercise ? 'Exercises' : 'Assignments'}
        </Button>
      )}
      {!isExercise && checkedState.status !== 'success' && (
        <>
          <Link
            href="/admin/course"
            className="text-body2_m_14 text-color-neutral-50 hover:text-primary self-start underline underline-offset-4"
          >
            Back to Course List
          </Link>
          {information !== undefined && (
            <BlueprintCourseMetadata information={information} detail />
          )}
          {navigation}
        </>
      )}
      <BlueprintReadBoundary state={checkedState}>
        {(detail) => {
          const problems = detail.blueprintAssignmentProblem
            ?.slice()
            .sort((a, b) => a.order - b.order)
          const problemCellClass = isExercise
            ? undefined
            : 'text-body2_m_14 text-color-cool-neutral-30 border-line h-9 border-b px-2.5 py-[7px] text-left tracking-[-0.42px] md:py-[7px]'
          const schedules = (
            <section
              className={cn(
                'flex flex-col',
                isExercise
                  ? 'gap-3'
                  : 'border-line gap-[14px] border-b pb-[29px]'
              )}
              aria-label="Sections"
            >
              <h3
                className={
                  isExercise
                    ? 'text-sub3_sb_16'
                    : 'text-sub3_sb_16 p-2.5 tracking-[-0.48px] text-black'
                }
              >
                {isExercise ? 'Sections' : 'Section Schedule'}
              </h3>
              <div className={isExercise ? undefined : 'min-w-0 pl-[38px]'}>
                <BlueprintAssignmentSections
                  copies={detail.assignment}
                  isExercise={isExercise}
                  compact={!isExercise}
                />
              </div>
            </section>
          )
          return (
            <article
              className={cn(
                'flex min-w-0 flex-col',
                isExercise ? 'gap-8' : 'gap-[15px]'
              )}
              aria-label="Master Information"
            >
              {isExercise ? (
                <header className="flex flex-col gap-2">
                  <h1 className="text-head3_sb_28">Master Information</h1>
                  <h2 className="text-head5_sb_24 break-words">
                    {detail.title}
                  </h2>
                  <p className="text-body2_m_14">Week {detail.week}</p>
                </header>
              ) : (
                <div>
                  <header className="flex flex-wrap items-center justify-between gap-x-7 gap-y-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-7 gap-y-3">
                      <div className="flex min-w-0 items-start gap-7">
                        <button
                          type="button"
                          onClick={onBack}
                          aria-label="Back to Assignments"
                          className="mt-[11px] shrink-0 rounded-sm focus-visible:outline focus-visible:outline-2"
                        >
                          <BackIcon
                            aria-hidden="true"
                            className="-scale-x-100"
                          />
                        </button>
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h1 className="text-head2_b_32 min-w-0 break-words text-black [overflow-wrap:anywhere]">
                            {detail.title}
                          </h1>
                          <span className="bg-primary text-caption2_m_12 shrink-0 rounded-full px-4 py-1.5 tracking-[-0.36px] text-white">
                            Blueprint
                          </span>
                        </div>
                      </div>
                      {information !== undefined && (
                        <BlueprintCourseMetadata
                          information={information}
                          detail
                        />
                      )}
                    </div>
                    <Link
                      href="/admin/course"
                      className="text-body2_m_14 text-color-neutral-50 hover:text-primary rounded-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
                    >
                      Back to Course List
                    </Link>
                  </header>
                  <p className="text-body2_m_14 mt-2 pl-12">
                    Week {detail.week}
                  </p>
                  {navigation}
                </div>
              )}

              <section
                className={cn(
                  'flex min-w-0 flex-col',
                  isExercise ? 'gap-3' : 'border-line border-b pb-[15px]'
                )}
                aria-label="Description"
              >
                <h3
                  className={
                    isExercise
                      ? 'text-sub3_sb_16'
                      : 'text-sub3_sb_16 p-2.5 tracking-[-0.48px] text-black'
                  }
                >
                  Description
                </h3>
                <KatexContent
                  content={detail.description}
                  classname={cn(
                    'max-w-full overflow-x-auto [overflow-wrap:anywhere]',
                    isExercise
                      ? 'rounded-xl bg-white p-6'
                      : 'text-body2_m_14 px-[38px] py-2.5 tracking-[-0.42px] text-black [&_p:first-child]:mt-0'
                  )}
                />
              </section>

              {!isExercise && schedules}

              <section
                className={cn(
                  'flex min-w-0 flex-col',
                  isExercise
                    ? 'gap-3'
                    : 'border-line gap-[14px] border-b pb-[29px]'
                )}
                aria-label="Included Problems"
              >
                <h3
                  className={
                    isExercise
                      ? 'text-sub3_sb_16'
                      : 'text-sub3_sb_16 flex items-center gap-2.5 p-2.5 tracking-[-0.48px] text-black'
                  }
                >
                  {isExercise ? 'Included Problems' : 'Included Problem'}
                  {!isExercise && problems && (
                    <span className="text-color-neutral-80">
                      ({problems.length})
                    </span>
                  )}
                </h3>
                <div className={isExercise ? undefined : 'min-w-0 pl-10'}>
                  {problems === undefined && (
                    <p role="status">Problem information is unavailable.</p>
                  )}
                  {problems?.length === 0 && <p>No included problems.</p>}
                  {problems && problems.length > 0 && (
                    <Table
                      aria-label="Included problems"
                      className={cn(
                        isExercise
                          ? 'rounded-xl border border-gray-200'
                          : 'border-line border [border-radius:8px]'
                      )}
                    >
                      <TableHeader
                        className={
                          isExercise ? undefined : 'border-line border-b'
                        }
                      >
                        <TableRow
                          className={
                            isExercise ? 'bg-gray-50' : 'bg-color-neutral-99'
                          }
                        >
                          {(isExercise
                            ? ['Order', 'Title']
                            : ['Order', 'Problem', 'Score']
                          ).map((label) => (
                            <TableHead
                              key={label}
                              scope="col"
                              className={cn(
                                'text-body2_m_14',
                                isExercise
                                  ? 'p-4'
                                  : 'text-color-cool-neutral-15 h-[37px] px-2.5 py-2 text-left tracking-[-0.42px]'
                              )}
                            >
                              {label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {problems.map((problem, index) => (
                          <TableRow key={problem.problemId}>
                            <TableCell
                              className={cn('text-center', problemCellClass)}
                            >
                              {convertToLetter(index)}
                            </TableCell>
                            <TableCell className={problemCellClass}>
                              {problem.title}
                            </TableCell>
                            {!isExercise && (
                              <TableCell
                                className={cn('text-center', problemCellClass)}
                              >
                                {problem.score}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                        {!isExercise && (
                          <TableRow className="bg-color-neutral-99">
                            <TableCell
                              colSpan={2}
                              className={cn(
                                problemCellClass,
                                'text-sub4_sb_14 text-right'
                              )}
                            >
                              Total
                            </TableCell>
                            <TableCell
                              className={cn(
                                problemCellClass,
                                'text-sub4_sb_14 text-primary'
                              )}
                            >
                              {problems.reduce(
                                (total, problem) => total + problem.score,
                                0
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </section>

              <section
                className={cn(
                  'flex flex-col',
                  isExercise ? 'gap-3' : 'gap-2.5'
                )}
                aria-label="Settings"
              >
                <h3
                  className={
                    isExercise
                      ? 'text-sub3_sb_16'
                      : 'text-sub3_sb_16 p-2.5 tracking-[-0.48px] text-black'
                  }
                >
                  {isExercise ? 'Exercise Settings' : 'Assignment Setting'}
                </h3>
                <dl
                  className={cn(
                    'flex flex-col',
                    isExercise
                      ? 'gap-4 rounded-xl bg-white p-6'
                      : 'gap-[14px] px-[38px]'
                  )}
                >
                  {settings.map(([key, label]) => (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center',
                        isExercise ? 'gap-4' : 'flex-wrap gap-x-[15px] gap-y-1'
                      )}
                    >
                      <dt
                        className={
                          isExercise
                            ? 'text-body1_m_16'
                            : 'text-body2_m_14 tracking-[-0.42px] text-black'
                        }
                      >
                        {label}
                      </dt>
                      <dd
                        className={cn(
                          'rounded-full',
                          isExercise
                            ? 'text-body2_m_14 bg-gray-100 px-4 py-1'
                            : 'text-caption2_m_12 flex h-5 min-w-[55px] shrink-0 items-center justify-center px-4 tracking-[-0.36px]',
                          !isExercise &&
                            (detail[key] === true
                              ? 'bg-primary text-white'
                              : 'bg-line text-color-cool-neutral-40')
                        )}
                      >
                        {settingValue(detail[key])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {isExercise && schedules}
            </article>
          )
        }}
      </BlueprintReadBoundary>
    </div>
  )
}
