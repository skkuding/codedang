import { fetcher } from '@/lib/utils'
import type { Problem } from '@/types/type'

interface Props {
  search: string
  order: string
}

export default async function ProblemNumber({ search, order }: Props) {
  const problems: Problem[] = await fetcher
    .get('problem', {
      searchParams: {
        take: 10,
        search,
        order
      }
    })
    .json()

  return (
    <p className="text-xl font-extrabold">
      All <span className="text-primary">{problems.length}</span>
    </p>
  )
}
