import TestcaseTable from './TestcaseTable'

const response = [
  {
    id: 1,
    input: '1 2',
    output: '3',
    result: 'Accepted'
  },
  {
    id: 2,
    input: '3 4',
    output: '7',
    result: 'Judging'
  },
  {
    id: 3,
    input: '5 6',
    output: '11',
    result: 'Compile Error'
  }
]

export default function TestcasePanel() {
  return (
    <>
      <div className="flex h-12">
        <div className="w-48 content-center text-center">Testcase Result</div>
        <div className="w-full rounded-bl-lg border border-t-0 border-slate-700 bg-[#121728]" />
      </div>
      <div className="flex flex-col gap-4 p-5">
        <p className="text-slate-400">
          Test Case Correctness: <span className="text-white">3/4</span>
        </p>
        <TestcaseTable data={response} />
      </div>
    </>
  )
}
