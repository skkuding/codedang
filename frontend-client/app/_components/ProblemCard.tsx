import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkbookProblem } from '@/types/type'
import Badge from './Badge'

interface Props {
  problem: WorkbookProblem
}

export default function ProblemCard({ problem }: Props) {
  return (
    <div className="w-1/3 px-2 py-5">
      <Card className="flex h-56 flex-col justify-between bg-gray-500">
        <Badge badge={problem.difficulty} />
        <div>
          <CardHeader className="p-5">
            <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl text-white">
              {problem.title}
            </CardTitle>
          </CardHeader>
          <CardFooter className="rounded-b-3xl bg-white text-sm">
            <p>
              Solved Rate: {/* TODO: 백엔드 API 변경되면 AC Rate 값 추가 */}
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}
