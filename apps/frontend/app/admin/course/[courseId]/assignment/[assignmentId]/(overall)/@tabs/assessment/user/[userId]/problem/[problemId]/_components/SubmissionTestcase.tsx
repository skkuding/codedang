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
import { ResultStatus, type TestCaseResult } from '@generated/graphql'

interface SubmissionTestcaseProps {
  testResults: (Omit<TestCaseResult, 'problemTestcase'> & {
    expectedOutput: string
    order: number
    input: string
  })[]
}

export function SubmissionTestcase({ testResults }: SubmissionTestcaseProps) {
  const { setSelectedTestcase, setIsTestResult } = useTestcaseStore()

  const handleTestcaseSelect = (
    order: number,
    isHidden: boolean,
    id: number
  ) => {
    setSelectedTestcase(order, isHidden, id)
    setIsTestResult(false)
  }

  return (
    <div>
      <h2 className="text-lg font-bold">Testcase</h2>
      <Table className="**:text-center **:text-sm **:hover:bg-transparent [&_td]:p-2 [&_tr]:border-slate-600">
        <TableHeader className="**:text-slate-100">
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Score Weight</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testResults
            .sort((a, b) => Number(a.isHidden) - Number(b.isHidden))
            .map((item) => {
              const caseLabel = item.isHidden
                ? `Hidden #${item.order}`
                : `Sample #${item.order}`
              return (
                <TableRow
                  className="cursor-pointer text-[#9B9B9B] hover:bg-slate-800"
                  key={item.problemTestcaseId}
                  onClick={() => {
                    handleTestcaseSelect(
                      item.order,
                      item.isHidden,
                      item.problemTestcaseId
                    )
                    console.log(item.order, item.isHidden)
                  }}
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
                const totalTestcases = testResults.length
                const correctTestcases = testResults.filter(
                  (item) => item.result === ResultStatus.Accepted
                ).length
                return `${correctTestcases}/${totalTestcases}`
              })()}
            </TableCell>
            <TableCell colSpan={3} />
            <TableCell>
              {(() => {
                const totalPercentage = testResults.reduce((sum, item) => {
                  if (
                    item.scoreWeightNumerator &&
                    item.scoreWeightDenominator
                  ) {
                    const percentage =
                      (item.scoreWeightNumerator /
                        item.scoreWeightDenominator) *
                      100
                    return sum + percentage
                  }
                  return sum
                }, 0)
                return `${totalPercentage.toFixed(2)}%`
              })()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
