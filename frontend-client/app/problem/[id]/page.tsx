import { fetcher } from '@/lib/utils'
import type { ProblemDetail } from '@/types/type'
import Description from './_components/Description'

export default async function DescriptionPage({
  params
}: {
  params: { id: number }
}) {
  const { id } = params
  const data: ProblemDetail = await fetcher(`problem/${id}`).json()

  return <Description data={data} />
}
