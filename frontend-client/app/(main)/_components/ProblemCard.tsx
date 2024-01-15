import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkbookProblem } from '@/types/type'
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md'
import Badge from './Badge'

interface Props {
  problem: WorkbookProblem
}

export default function ProblemCard({ problem }: Props) {
  return (
    <Card className="my-2 flex h-32 w-96 flex-col justify-between rounded-md border-gray-300 bg-gray-50 transition hover:scale-105 hover:opacity-80">
      <CardHeader className="pb-0">
        <Badge
          type={problem.difficulty}
        >{`Level ${problem.difficulty[5]}`}</Badge>

        <CardTitle className="line-clamp-2 overflow-hidden break-keep text-lg font-semibold tracking-normal text-gray-700">
          {`#${problem.problemId} ${problem.title}`}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-1 text-xs text-gray-500">
        <MdOutlineSubdirectoryArrowRight />
        Solved Rate {/*TODO: 백엔드 API 변경되면 AC Rate 값 추가*/}%
      </CardContent>
    </Card>
  )
}
