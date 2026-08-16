import { ArticleNavigation } from '@/app/(client)/(main)/_components/ArticleNavigation'
import { KatexContent } from '@/components/KatexContent'
import { fetcher } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'

interface NoticeDetailProps {
  params: Promise<{
    noticeId: string
  }>
  searchParams: Promise<{
    page: string | undefined
  }>
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

export default async function NoticeDetail(props: NoticeDetailProps) {
  const { noticeId } = await props.params
  const { page } = await props.searchParams

  const noticeIdRes: NoticeIdProps = await fetcher
    .get(`notice/${noticeId}`)
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
      <header className="border-line flex flex-col gap-3 border-b pb-7">
        <h2 className="text-head2_b_32 break-words">{title}</h2>
        <div className="text-color-cool-neutral-40 text-sub2_m_18 flex items-center gap-3">
          <p>{dateFormatter(createTime, 'YYYY. MM. DD')}</p>
          <span className="text-color-neutral-80">|</span>
          <p>{createdBy}</p>
        </div>
      </header>
      <KatexContent
        content={content}
        classname="prose w-full max-w-full px-0 pt-10 pb-30 text-color-cool-neutral-30 text-body1_m_16"
      />
      <ArticleNavigation
        prev={prev}
        next={next}
        basePath="/notice"
        page={page}
      />
    </article>
  )
}
