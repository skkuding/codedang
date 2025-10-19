import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/shadcn/table'
import { getResultColor } from '@/libs/utils'
import { useTestcaseStore } from '@/stores/testcaseStore'
import type { SubmissionDetail } from '@generated/graphql'

interface SubmissionTestcaseProps {
  submission: SubmissionDetail | null
}

export function SubmissionTestcase({ submission }: SubmissionTestcaseProps) {
  const setSelectedTestcaseId = useTestcaseStore(
    (state) => state.setSelectedTestcaseId
  )

  const handleTestcaseSelect = (testcaseId: number) => {
    console.log('Selected testcaseId:', testcaseId)
    setSelectedTestcaseId(testcaseId)
  }

  if (!submission) {
    return <div className="h-72" />
  }

  const firstHiddenIndex = submission.testcaseResult.findIndex(
    (item) => item.isHidden
  )

  return (
    <div>
      {submission.testcaseResult.length !== 0 && (
        <div>
          <h2 className="text-lg font-bold">Testcase</h2>
          <Table className="**:text-center **:text-sm **:hover:bg-transparent [&_td]:p-2 [&_tr]:border-slate-600">
            <TableHeader className="**:text-slate-100">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>ScoreWeight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submission.testcaseResult.map((item, index) => {
                const isHiddenTestCase =
                  item.isHidden ??
                  (firstHiddenIndex !== -1 && index >= firstHiddenIndex)

                const caseLabel = isHiddenTestCase
                  ? `Hidden #${index - firstHiddenIndex + 1}`
                  : `Sample #${index + 1}`

                return (
                  <TableRow
                    className="cursor-pointer text-[#9B9B9B] hover:bg-slate-800"
                    key={item.problemTestcaseId}
                    onClick={() => handleTestcaseSelect(item.problemTestcaseId)}
                  >
                    <TableCell>
                      <div className="py-2">{caseLabel}</div>
                    </TableCell>
                    <TableCell className={getResultColor(item.result)}>
                      {item.result}
                    </TableCell>
                    <TableCell>
                      {item.cpuTime ? `${item.cpuTime} ms` : '-'}
                    </TableCell>
                    <TableCell>
                      {item.memoryUsage
                        ? `${(item.memoryUsage / (1024 * 1024)).toFixed(2)} MB`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        if (
                          item.scoreWeightNumerator &&
                          item.scoreWeightDenominator
                        ) {
                          const percentage =
                            (item.scoreWeightNumerator /
                              item.scoreWeightDenominator) *
                            100
                          return `${percentage.toFixed(2)}%`
                        }
                        return '-'
                      })()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter className="bg-transparent">
              <TableRow>
                <TableCell>
                  {(() => {
                    const totalTestcases = submission.testcaseResult.length
                    const correctTestcases = submission.testcaseResult.filter(
                      (item) => item.result === 'Accepted'
                    ).length
                    return `${correctTestcases}/${totalTestcases}`
                  })()}
                </TableCell>
                <TableCell colSpan={3} />
                <TableCell>{`${submission.score}%`}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  )
}
