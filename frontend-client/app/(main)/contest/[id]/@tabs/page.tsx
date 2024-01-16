import { baseUrl } from '@/lib/vars'
import { sanitize } from 'isomorphic-dompurify'
import type { ContestDetailProps } from '../layout'

export default async function ContestTop({
  params
}: {
  params: ContestDetailProps['params']
  tabs: React.ReactNode
}) {
  const { id } = params
  const { description } = await fetch(baseUrl + `/contest/${id}`).then((res) =>
    res.json()
  )
  return (
    <main
      className="prose w-full max-w-full border-b border-t border-b-gray-400 border-t-gray-400 p-5 py-12"
      dangerouslySetInnerHTML={{ __html: sanitize(description) }}
    />
  )
}
