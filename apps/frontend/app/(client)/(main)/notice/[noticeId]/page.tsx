import { KatexContent } from '@/components/KatexContent'
import { fetcherWithAuth } from '@/libs/utils'
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

interface NoticeIdProps {
  current: {
    title: string
    content: string
    createTime: string
    updateTime: string
    createdBy: string
  }
  prev?: {
    id: string
    title: string
  }
  next?: {
    id: string
    title: string
  }
}

export default async function NoticeDetail({
  params,
  searchParams
}: NoticeDetailProps) {
  const { noticeId } = params
  const { page } = searchParams

  // NOTE: 추후 백엔드 Notice 로직 변경되면 다시 수정 예정 (현재는 fetcherWithAuth 이용중 but 로그인 안하고 fetcher로도 가능하게끔 논의 예정)
  const noticeIdRes: NoticeIdProps = await fetcherWithAuth
    .get(`notice/${noticeId}`, {
      searchParams: {
        groupId: '1'
      }
    })
    .json()

  console.log('noticeIdRes: ', noticeIdRes)

  // Ensure noticeIdRes has the expected structure
  if (!noticeIdRes || !noticeIdRes.current) {
    console.error(
      'You need to login first for now! (This will be updated to allow access without login in the few days.)'
    )
    return (
      <div>
        You need to login first for now!
        <br />
        (This will be updated to allow access without login in the few days.)
      </div>
    )
  }

  const {
    current: { title, content, createTime, createdBy },
    prev,
    next
  } = noticeIdRes

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
