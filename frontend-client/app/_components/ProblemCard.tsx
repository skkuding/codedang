import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkbookProblem } from '@/types/type'
import Badge from './Badge'

interface Props {
  problem: WorkbookProblem
}

export default function ProblemCard({ problem }: Props) {
  return (
    <Card className="bg-gray-500">
      <Badge badge={problem.difficulty}></Badge>
      <CardHeader>
        <CardTitle className="text-3xl text-white">{problem.title}</CardTitle>
      </CardHeader>
      <CardFooter className="justify-between rounded-b-3xl bg-white">
        <p>Solved Rate: {/* TODO: 백엔드 API 변경되면 AC Rate 값 추가 */}</p>
      </CardFooter>
    </Card>
  )
}
