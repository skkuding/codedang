import Codeeditor from '@/components/Codeeditor'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { fetcherWithAuth } from '@/lib/utils'
import type { SubmissionDetail } from '@/types/type'
import dayjs from 'dayjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function SubmissionDetail({
  params
}: {
  params: {
    id: string
    submissionId: string
  }
}) {
  const { submissionId, id } = params
  const data: SubmissionDetail = await fetcherWithAuth(
    `submission/${submissionId}`,
    {
      searchParams: {
        problemId: id
      },
      next: {
        revalidate: 0
      }
    }
  ).json()
  return (
    <div className="flex flex-col gap-5 overflow-auto p-6">
      <div className="flex items-center gap-3 ">
        <Link href={`/problem/${id}/submission`}>
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">Submission #{submissionId}</h1>
      </div>
      <ScrollArea className="shrink-0 rounded-md">
        <div className="flex items-center justify-around gap-5 bg-slate-700 p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_*]:whitespace-nowrap [&_p]:text-slate-400">
          <div>
            <h2>User</h2>
            <p>{data.username}</p>
          </div>
          <div>
            <h2>Result</h2>
            <p
              className={
                data.result === 'Accepted' ? '!text-green-500' : '!text-red-500'
              }
            >
              {data.result}
            </p>
          </div>
          <div>
            <h2>Language</h2>
            <p>{data.language}</p>
          </div>
          <div>
            <h2>Submission Time</h2>
            <p>{dayjs(data.createTime).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div>
        <h2 className="mb-3 text-lg font-bold">Source Code</h2>
        <Codeeditor
          value={data.code}
          language={data.language}
          editable={false}
          className="max-h-96 min-h-16 w-full"
        />
      </div>
    </div>
  )
}
