import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn, getResultColor } from '@/libs/utils'
import type { TabbedTestResult } from '@/types/type'
import { WhitespaceVisualizer } from '../WhitespaceVisualizer'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { TAB_CONTENT } from './TestcasePanel'

export function TestcaseTable({
  data,
  moveToDetailTab
}: {
  data: TabbedTestResult[]
  moveToDetailTab: (tab: TabbedTestResult) => void
}) {
  const isTesting = useTestPollingStore((state) => state.isTesting)
  return (
    <Table className="rounded-t-md">
      <TableHeader className="bg-[#121728] [&_tr]:border-b-slate-600">
        <TableRow className="text-base hover:bg-slate-900/60">
          <TableHead className="w-[10%] text-left">No</TableHead>
          <TableHead className="w-[25%] text-left">Input</TableHead>
          <TableHead className="w-[25%] text-left">Expected Output</TableHead>
          <TableHead className="w-[25%] text-left">Output</TableHead>
          <TableHead className="w-[15%] text-left">Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((testResult) => (
          <TableRow
            key={testResult.id}
            className="cursor-pointer border-b border-b-slate-600 text-left hover:bg-slate-700"
            onClick={() => moveToDetailTab(testResult)}
          >
            <TableCell className="p-3 text-left md:p-3">
              {TAB_CONTENT[testResult.type]} #{testResult.id}
            </TableCell>
            <TableCell className="max-w-96 truncate p-3 md:p-3">
              <WhitespaceVisualizer
                text={testResult.input}
                isTruncated={true}
                className="h-fit max-h-24"
              />
            </TableCell>
            <TableCell className="max-w-96 truncate p-3 md:p-3">
              <WhitespaceVisualizer
                text={testResult.expectedOutput}
                isTruncated={true}
                className="h-fit max-h-24"
              />
            </TableCell>
            <TableCell className="max-w-96 truncate p-3 md:p-3">
              <WhitespaceVisualizer
                text={testResult.output}
                isTruncated={true}
                className="h-fit max-h-24"
              />
            </TableCell>
            <TableCell
              className={cn(
                'p-3 text-left md:p-3',
                getResultColor(isTesting ? null : testResult.result)
              )}
            >
              {isTesting ? 'Judging' : testResult.result}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
