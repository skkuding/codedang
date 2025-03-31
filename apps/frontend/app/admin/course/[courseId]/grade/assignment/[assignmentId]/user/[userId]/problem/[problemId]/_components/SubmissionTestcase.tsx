import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import type { SubmissionDetail } from '@generated/graphql'

interface SubmissionTestcaseProps {
  submission: SubmissionDetail | null
}

export function SubmissionTestcase({ submission }: SubmissionTestcaseProps) {
  if (!submission) {
    return <div className="h-72" />
  }

  return (
    <div>
      {submission.testcaseResult.length !== 0 && (
        <div>
          <h2 className="text-lg font-bold">Testcase</h2>
          <Table className="[&_*]:text-center [&_*]:text-sm [&_*]:hover:bg-transparent [&_td]:p-2 [&_tr]:border-slate-600">
            <TableHeader className="[&_*]:text-slate-100">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Memory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submission.testcaseResult.map((item) => (
                <TableRow
                  className="text-[#9B9B9B]"
                  key={item.problemTestcaseId}
                >
                  <TableCell>
                    <div className="py-2">
                      {item.problemTestcaseId.toString()}
                    </div>
                  </TableCell>
                  <TableCell>{item.result}</TableCell>
                  <TableCell>
                    {item.cpuTime ? `${item.cpuTime} ms` : '-'}
                  </TableCell>
                  <TableCell>
                    {item.memoryUsage
                      ? `${(item.memoryUsage / (1024 * 1024)).toFixed(2)} MB`
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
