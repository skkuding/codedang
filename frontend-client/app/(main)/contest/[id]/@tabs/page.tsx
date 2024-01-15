import { baseUrl } from '@/lib/vars'
import { sanitize } from 'isomorphic-dompurify'

interface ContestDetailProps {
  params: {
    id: string
  }
}

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
      className="prose w-full max-w-full border-b border-b-gray-200 p-5 py-12"
      dangerouslySetInnerHTML={{ __html: sanitize(description) }}
    />
  )
}
