import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/utils'
import { sanitize } from 'isomorphic-dompurify'
import type { ContestDetailProps } from '../layout'

interface ContestTop {
  description: string
}

export default async function ContestTop({
  params
}: {
  params: ContestDetailProps['params']
  tabs: React.ReactNode
}) {
  const { id } = params
  const data: ContestTop = await fetcher.get(`contest/${id}`).json()
  return (
    <>
      <main
        className="prose w-full max-w-full border-b-2 border-b-gray-300 p-5 py-12"
        dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
      />
      {/* TODO: Participate Contest API */}
      <div className="mt-10 flex justify-center">
        <Button className="px-12 py-6 text-lg font-light">Register</Button>
      </div>
    </>
  )
}
