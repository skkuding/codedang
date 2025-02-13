import { getContestProblemList } from '@/app/(client)/_libs/apis/contestProblem'
import { Button } from '@/components/shadcn/button'
import Link from 'next/link'

interface GoToFirstProblemButtonProps {
  contestId: number
}

export async function GoToFirstProblemButton({
  contestId
}: GoToFirstProblemButtonProps) {
  const { data } = await getContestProblemList({ contestId, take: 1 })

  const firstProblemId = data.at(0)?.id

  return firstProblemId ? (
    <Button className="px-12 py-6 text-lg font-light">
      <Link href={`/contest/${contestId}/problem/${firstProblemId}`}>
        Go To First Problem!
      </Link>
    </Button>
  ) : null
}
