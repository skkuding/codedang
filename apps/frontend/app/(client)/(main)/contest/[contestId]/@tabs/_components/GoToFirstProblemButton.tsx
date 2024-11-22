'use client'

import { contestProblemQueries } from '@/app/(client)/_libs/queries/contestProblem'
import { Button } from '@/components/shadcn/button'
import { Skeleton } from '@/components/shadcn/skeleton'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface GoToFirstProblemButtonProps {
  contestId: number
}

export function GoToFirstProblemButton({
  contestId
}: GoToFirstProblemButtonProps) {
  const router = useRouter()
  const { data: firstProblemId } = useSuspenseQuery({
    ...contestProblemQueries.list({ contestId, take: 1 }),
    select: (data) => data.data.at(0)?.id
  })

  return (
    <Button
      className="px-12 py-6 text-lg font-light"
      onClick={() =>
        router.push(`/contest/${contestId}/problem/${firstProblemId}`)
      }
    >
      Go To First Problem!
    </Button>
  )
}

export function GoToFirstProblemButtonFallback() {
  return <Skeleton className="h-12 w-60" />
}
