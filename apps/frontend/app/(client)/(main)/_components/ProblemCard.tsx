import type { Problem } from '@/types/type'

interface Props {
  problem: Problem
}

export function ProblemCard({ problem }: Props) {
  return (
    <div className="flex w-full flex-col justify-between gap-4 rounded-md border border-gray-200 p-4 shadow-none transition hover:scale-105">
      <div className="flex flex-col justify-between gap-4 pt-2">
        <p className="text-body2_m_14 text-gray-500">{`Problem #${problem.id}`}</p>
        <div className="text-sub1_sb_18 line-clamp-2 h-11 whitespace-pre-wrap">
          {problem.title}
        </div>
      </div>
      <div className="border-t-2" />
      <div className="text-caption4_r_12 grid grid-cols-1 text-gray-500 min-[400px]:grid-cols-2">
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-body2_m_14">Level</p>
          <p className="text-head5_sb_24 text-black">
            {problem.difficulty.substring(5)}
          </p>
        </div>
        <div className="hidden flex-col items-center gap-2 border-l-2 py-4 min-[400px]:flex">
          <p className="text-body2_m_14">Submission</p>
          <p className="text-head5_sb_24 text-black">
            {problem.submissionCount}
          </p>
        </div>
      </div>
    </div>
  )
}
