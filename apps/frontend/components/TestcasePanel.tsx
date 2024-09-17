import type { TestcaseResult } from '@/types/type'
import TestcaseTable from './TestcaseTable'
import { ScrollArea } from './ui/scroll-area'

export default function TestcasePanel({ data }: { data: TestcaseResult[] }) {
  const acceptedConunt = data.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length
  const total = data.length
  return data.length !== 0 ? (
    <>
      <div className="flex h-12">
        <div className="w-48 content-center text-center">Testcase Result</div>
        <div className="w-full rounded-bl-lg border border-t-0 border-slate-700 bg-[#121728]" />
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 p-5">
          <p className="text-slate-400">
            Test Case Correctness:{' '}
            <span className="text-white">
              {acceptedConunt}/{total}
            </span>
          </p>
          <TestcaseTable data={data} />
        </div>
      </ScrollArea>
    </>
  ) : null
}
