import { getContestProblemList } from '@/app/(client)/_libs/apis/contestProblem'
import { Button } from '@/components/shadcn/button'
import { getTranslate } from '@/tolgee/server'
import Link from 'next/link'

interface GoToFirstProblemButtonProps {
  contestId: number
}

export async function GoToFirstProblemButton({
  contestId
}: GoToFirstProblemButtonProps) {
  const { data } = await getContestProblemList({ contestId, take: 1 })

  const firstProblemId = data.at(0)?.id

  const t = await getTranslate()

  return firstProblemId ? (
    <Button className="px-12 py-6 text-lg font-light">
      <Link href={`/contest/${contestId}/problem/${firstProblemId}`}>
        {t('go_to_first_problem_button')}
      </Link>
    </Button>
  ) : null
}
