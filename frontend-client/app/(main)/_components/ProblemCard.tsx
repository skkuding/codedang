import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkbookProblem } from '@/types/type'
import { MdOutlineSubdirectoryArrowRight } from 'react-icons/md'
import Badge from './Badge'

interface Props {
  problem: WorkbookProblem
}

export default function ProblemCard({ problem }: Props) {
  return (
    <Card className="flex w-full flex-col justify-between gap-1 shadow-none transition hover:scale-105 hover:opacity-80">
      <CardHeader className="pb-0">
        <Badge
          type={problem.difficulty}
        >{`Level ${problem.difficulty[5]}`}</Badge>
        <CardTitle className="overflow-hidden text-ellipsis text-nowrap text-lg font-semibold">
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
