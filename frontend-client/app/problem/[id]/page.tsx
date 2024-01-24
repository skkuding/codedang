import { baseUrl } from '@/lib/vars'
import Description from './_components/Description'

export default async function DescriptionPage({
  params
}: {
  params: { id: number }
}) {
  const { id } = params
  const response = await fetch(baseUrl + '/problem/' + id)
  const data = await response.json()

  return <Description data={data} />
}
