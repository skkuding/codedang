import type { TestcaseResult } from '@/types/type'
import TestcaseTable from './TestcaseTable'
import { ScrollArea } from './ui/scroll-area'

export default function TestcasePanel({ data }: { data: TestcaseResult[] }) {
  const acceptedConunt = data.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length
  const total = data.length
  const dataWithIndex = data.map((testcase, index) => ({
    ...testcase,
    id: index + 1
  }))
  const notAcceptedIndexes = dataWithIndex
    .map((testcase, index) => (testcase.result !== 'Accepted' ? index : -1))
    .filter((index) => index !== -1)
  return dataWithIndex.length !== 0 ? (
    <>
      <div className="flex h-12">
        <div className="w-48 content-center text-center">Testcase Result</div>
        <div className="w-full rounded-bl-lg border border-t-0 border-slate-700 bg-[#121728]" />
      </div>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-6 p-5">
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="py-1 text-slate-400">Correct Testcase</td>
                <td className="py-1 text-white">
                  {acceptedConunt}/{total}
                </td>
              </tr>
              {notAcceptedIndexes.length > 0 && (
                <tr>
                  <td className="min-w-52 py-1 align-top text-slate-400">
                    Wrong Testcase Number
                  </td>
                  <td className="py-1 text-white">
                    {notAcceptedIndexes
                      .map((index) => `Sample #${index + 1}`)
                      .join(', ')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TestcaseTable data={dataWithIndex} />
        </div>
      </ScrollArea>
    </>
  ) : null
}
