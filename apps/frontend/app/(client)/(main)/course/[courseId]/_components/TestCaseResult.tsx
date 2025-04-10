import { Progress } from '@/components/shadcn/progress'
import type { ProblemSubmission } from '@/types/type'

interface TestCaseResulProps {
  submission: ProblemSubmission
}

export function TestCaseResult({ submission }: TestCaseResulProps) {
  return (
    submission && (
      <div className="flex w-[100px] flex-col gap-[4px]">
        <Progress
          value={
            (submission.acceptedTestcaseCount / submission.testcaseCount) * 100
          }
        />
        <div className="flex w-full justify-center gap-1 text-xs">
          <p>
            {submission.acceptedTestcaseCount} / {submission.testcaseCount}
          </p>
          <p className="text-primary">Accepted</p>
        </div>
      </div>
    )
  )
}
