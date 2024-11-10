import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn, getResultColor } from '@/lib/utils'
import type { TestResultDetail } from '@/types/type'
import { WhitespaceVisualizer } from './WhitespaceVisualizer'

export default function TestcaseTable({
  data,
  testcaseTabList,
  setTestcaseTabList,
  setCurrentTab
}: {
  data: TestResultDetail[]
  testcaseTabList: TestResultDetail[]
  setTestcaseTabList: (data: TestResultDetail[]) => void
  setCurrentTab: (data: number) => void
}) {
  function handleRowClick(index: number) {
    setCurrentTab(index + 1)
    const updatedList = [...testcaseTabList, data[index]]
    const uniqueList = updatedList.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    )
    setTestcaseTabList(uniqueList)
  }

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
        {data.map((testResult, index) => (
          <TableRow
            key={testResult.id}
            className="cursor-pointer border-b border-b-slate-600 text-left hover:bg-slate-700"
            onClick={() => {
              handleRowClick(index)
            }}
          >
            <TableCell className="p-3 text-left md:p-3">
              Sample #{testResult.id}
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
                getResultColor(testResult.result)
              )}
            >
              {testResult.result}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
