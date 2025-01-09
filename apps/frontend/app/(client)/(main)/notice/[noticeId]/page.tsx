import KatexContent from '@/components/KatexContent'
import { baseUrl } from '@/libs/constants'
import { dateFormatter } from '@/libs/utils'
import Link from 'next/link'
import { RxHamburgerMenu } from 'react-icons/rx'

interface NoticeDetailProps {
  params: {
    noticeId: string
  }
  searchParams: {
    page: string | undefined
  }
}

export default async function NoticeDetail({
  params,
  searchParams
}: NoticeDetailProps) {
  const { noticeId } = params
  const { page } = searchParams
  const {
    current: { title, content, createTime, createdBy },
    prev,
    next
  } = await fetch(baseUrl + `/notice/${noticeId}`).then((res) => res.json())

  return (
    <article>
      <header className="border-b border-b-gray-200 p-5 py-4">
        <h2 className="break-words text-lg font-semibold">{title}</h2>
        <div className="mt-1 flex justify-between text-sm text-gray-400">
          <p>{createdBy}</p>
          <p>{dateFormatter(createTime, 'YYYY-MM-DD')}</p>
        </div>
      </header>
      <KatexContent
        content={content}
        classname="prose w-full max-w-full p-5 py-12"
      />
      <footer className="flex flex-col">
        <div className="flex justify-end border-b border-b-gray-200 py-1">
          <Link
            href={{
              pathname: '/notice',
              query: { page }
            }}
            className="flex items-center justify-center gap-1 text-gray-400 hover:text-gray-500"
          >
            <RxHamburgerMenu />
            List
          </Link>
        </div>
        {prev && (
          <Link
            href={{
              pathname: `/notice/${prev.id}`,
              query: { page }
            }}
            key={prev.id}
            className="text-gray-400 hover:text-gray-500"
          >
            <div className="border-b border-b-gray-200 p-5 py-4">
              <span className="mr-5 font-bold text-gray-500">prev</span>
              {prev.title}
            </div>
          </Link>
        )}
        {next && (
          <Link
            href={{
              pathname: `/notice/${next.id}`,
              query: { page }
            }}
            key={next.id}
            className="text-gray-400 hover:text-gray-500"
          >
            <div className="border-b border-b-gray-200 p-5 py-4">
              <span className="mr-5 font-bold text-gray-500">next</span>
              {next.title}
            </div>
          </Link>
        )}
      </footer>
    </article>
  )
}
