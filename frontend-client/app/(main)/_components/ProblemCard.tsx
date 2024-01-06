import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkbookProblem } from '@/types/type'
import Badge from './Badge'

interface Props {
  problem: WorkbookProblem
}

export default function ProblemCard({ problem }: Props) {
  return (
    <Card className="my-2 flex h-40 w-60 flex-col justify-between border-gray-300 bg-gray-50 shadow-md transition hover:scale-105 hover:opacity-80 md:h-44 md:w-72">
      <CardHeader className="m-4 flex flex-row items-center justify-between space-y-0 p-0 text-sm">
        <Badge
          type={problem.difficulty}
          filled
        >{`Level ${problem.difficulty[5]}`}</Badge>
        <p className="text-gray-500">
          {/*TODO: 백엔드 API 변경되면 AC Rate 값 추가*/}% Solved
        </p>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <CardTitle className="line-clamp-2 overflow-hidden break-keep text-xl tracking-normal text-gray-600 md:text-2xl">
          {`#${problem.problemId} ${problem.title}`}
        </CardTitle>
      </CardContent>
    </Card>
  )
}
