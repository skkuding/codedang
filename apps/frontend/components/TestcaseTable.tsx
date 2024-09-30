import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { TestcaseResult } from '@/types/type'

export default function TestcaseTable({
  data,
  testcaseTabList,
  setTestcaseTabList,
  setCurrentTab
}: {
  data: TestcaseResult[]
  testcaseTabList: TestcaseResult[]
  setTestcaseTabList: (data: TestcaseResult[]) => void
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
          <TableHead className="w-[39%] text-left">Input</TableHead>
          <TableHead className="w-[39%] text-left">Output</TableHead>
          <TableHead className="w-[16%] text-left">Result</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((testResult, index) => (
          <TableRow
            key={testResult.id}
            className="border-b border-b-slate-600 text-left hover:bg-slate-700"
            onClick={() => {
              handleRowClick(index)
            }}
          >
            <TableCell className="p-3 text-left md:p-3">
              Sample #{testResult.id}
            </TableCell>
            <TableCell className="p-3 md:p-3">{testResult.input}</TableCell>
            <TableCell className="p-3 md:p-3">{testResult.output}</TableCell>
            <TableCell
              className={cn(
                'p-3 text-left md:p-3',
                testResult.result === 'Accepted'
                  ? 'text-green-500'
                  : testResult.result === 'Judging'
                    ? 'text-gray-300'
                    : 'text-red-500'
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
