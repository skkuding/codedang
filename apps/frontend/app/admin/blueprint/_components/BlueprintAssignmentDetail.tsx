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
import { convertToLetter } from '@/libs/utils'
import type {
  BlueprintAssignmentDetail as Detail,
  BlueprintReadState
} from '../_libs/types'
import { BlueprintAssignmentSections } from './BlueprintAssignmentSections'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'

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
  onBack
}: {
  state: BlueprintReadState<Detail>
  isExercise: boolean
  onBack: () => void
}) {
  const checkedState: BlueprintReadState<Detail> =
    state.status === 'success' && state.data.isExercise !== isExercise
      ? { status: 'not-found' }
      : state

  return (
    <div className="flex flex-col gap-6">
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={onBack}
      >
        Back to {isExercise ? 'Exercises' : 'Assignments'}
      </Button>
      <BlueprintReadBoundary state={checkedState}>
        {(detail) => {
          const problems = detail.blueprintAssignmentProblem
            ?.slice()
            .sort((a, b) => a.order - b.order)
          return (
            <article className="flex flex-col gap-8">
              <header className="flex flex-col gap-2">
                <h1 className="text-head3_sb_28">Master Information</h1>
                <h2 className="text-head5_sb_24 break-words">{detail.title}</h2>
                <p className="text-body2_m_14">Week {detail.week}</p>
              </header>

              <section className="flex flex-col gap-3" aria-label="Description">
                <h3 className="text-sub3_sb_16">Description</h3>
                <KatexContent
                  content={detail.description}
                  classname="max-w-full overflow-x-auto rounded-xl bg-white p-6 [overflow-wrap:anywhere]"
                />
              </section>

              <section
                className="flex flex-col gap-3"
                aria-label="Included Problems"
              >
                <h3 className="text-sub3_sb_16">Included Problems</h3>
                {problems === undefined && (
                  <p role="status">Problem information is unavailable.</p>
                )}
                {problems?.length === 0 && <p>No included problems.</p>}
                {problems && problems.length > 0 && (
                  <Table
                    aria-label="Included problems"
                    className="rounded-xl border border-gray-200"
                  >
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        {(isExercise
                          ? ['Order', 'Title']
                          : ['Order', 'Title', 'Score']
                        ).map((label) => (
                          <TableHead
                            key={label}
                            scope="col"
                            className="text-body2_m_14 p-4"
                          >
                            {label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {problems.map((problem, index) => (
                        <TableRow key={problem.problemId}>
                          <TableCell className="text-center">
                            {convertToLetter(index)}
                          </TableCell>
                          <TableCell>{problem.title}</TableCell>
                          {!isExercise && (
                            <TableCell className="text-center">
                              {problem.score}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {!isExercise && (
                        <TableRow className="bg-gray-50">
                          <TableCell
                            colSpan={2}
                            className="text-sub4_sb_14 text-right"
                          >
                            Total
                          </TableCell>
                          <TableCell className="text-sub4_sb_14 text-primary text-center">
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
              </section>

              <section className="flex flex-col gap-3" aria-label="Settings">
                <h3 className="text-sub3_sb_16">
                  {isExercise ? 'Exercise' : 'Assignment'} Settings
                </h3>
                <dl className="flex flex-col gap-4 rounded-xl bg-white p-6">
                  {settings.map(([key, label]) => (
                    <div key={key} className="flex items-center gap-4">
                      <dt className="text-body1_m_16">{label}</dt>
                      <dd className="text-body2_m_14 rounded-full bg-gray-100 px-4 py-1">
                        {settingValue(detail[key])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="flex flex-col gap-3" aria-label="Sections">
                <h3 className="text-sub3_sb_16">Sections</h3>
                <BlueprintAssignmentSections
                  copies={detail.assignment}
                  isExercise={isExercise}
                />
              </section>
            </article>
          )
        }}
      </BlueprintReadBoundary>
    </div>
  )
}
