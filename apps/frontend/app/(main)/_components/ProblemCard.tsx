import '@/components/ui/card'
import type { WorkbookProblem } from '@/types/type'

interface Props {
  problem: WorkbookProblem
}

export default function ProblemCard({ problem }: Props) {
  return (
    <div className="flex w-full flex-col justify-between gap-4 rounded-md border border-gray-200 p-4 shadow-none transition hover:scale-105">
      <div className="flex flex-col justify-between gap-4 pt-2">
        <p className="text-sm font-medium text-gray-500">{`Problem #${problem.id}`}</p>
        <div className="line-clamp-2 whitespace-pre-wrap text-lg font-semibold leading-tight">
          {`${problem.title}
          `}
        </div>
      </div>
      <div className="border-t-2"></div>
      <div className="grid grid-cols-2 text-xs text-gray-500">
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-sm font-medium">Level</p>
          <p className="text-2xl font-semibold text-black">{`${problem.difficulty.substring(5)}`}</p>
        </div>
        <div className="flex flex-col items-center gap-2 border-l-2 py-4">
          <p className="text-sm font-medium">Submission</p>
          <p className="text-2xl font-semibold text-black">{`${problem.submissionCount}`}</p>
        </div>
      </div>
    </div>
  )
}
