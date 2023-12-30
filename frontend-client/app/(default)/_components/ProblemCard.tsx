import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkbookProblem } from '@/types/type'
import Badge from './Badge'

interface Props {
  problem: WorkbookProblem
}

export default function ProblemCard({ problem }: Props) {
  return (
    <Card className="flex h-56 flex-col justify-between border-none bg-gray-700">
      <Badge badge={problem.difficulty} />
      <div>
        <CardHeader className="p-5">
          <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl tracking-normal text-white">
            {`#${problem.problemId} ${problem.title}`}
          </CardTitle>
        </CardHeader>
        <CardFooter className="rounded-b-3xl border border-gray-300 bg-white px-5 text-sm text-gray-500">
          <p>Solved Rate: {/* TODO: 백엔드 API 변경되면 AC Rate 값 추가 */}</p>
        </CardFooter>
      </div>
    </Card>
  )
}
