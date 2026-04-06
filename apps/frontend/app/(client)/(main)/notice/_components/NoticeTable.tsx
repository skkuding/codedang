import { fetcher } from '@/libs/utils'
import type { Notice } from '@/types/type'
import { columns } from './Columns'
import { NoticeDataTable } from './NoticeDataTable'

interface Props {
  search: string
}

interface NoticeProps {
  data: Notice[]
  total: number
}

const getFixedNotices = async () => {
  const fixedNoticesRes: NoticeProps = await fetcher
    .get('notice', {
      searchParams: {
        fixed: 'true',
        take: '10'
      }
    })
    .json()

  return fixedNoticesRes.data ?? fixedNoticesRes
}

const getNotices = async (search: string) => {
  const noticesRes: NoticeProps = await fetcher
    .get('notice', {
      searchParams: {
        search,
        take: '10'
      }
    })
    .json()

  return noticesRes.data ?? noticesRes
}

export async function NoticeTable({ search }: Props) {
  const fixedNoticesFetcher: Promise<Notice[]> | Notice[] =
    search !== '' ? [] : getFixedNotices()

  const noticesFetcher: Promise<Notice[]> = getNotices(search)

  // NOTE: 추후 백엔드 Notice 로직 변경되면 다시 수정 예정 (현재는 fetcherWithAuth 이용중 but 로그인 안하고 fetcher로도 가능하게끔 논의 예정)
  const [fixedNotices, notices] = await Promise.all([
    fixedNoticesFetcher,
    noticesFetcher
  ])

  // Ensure both fixedNotices and notices are arrays
  const currentPageData =
    Array.isArray(fixedNotices) && Array.isArray(notices)
      ? fixedNotices.concat(notices)
      : []

  if (!Array.isArray(fixedNotices) || !Array.isArray(notices)) {
    console.error('Error: Unauthorized or invalid data format')
  }

  return (
    <NoticeDataTable
      data={currentPageData}
      columns={columns}
      headerStyle={{
        title:
          'text-left shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] rounded-l-full px-5 text-body1_m_16 text-color-neutral-30',
        createTime:
          'text-left shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] w-[26%] px-5 text-body1_m_16 text-color-neutral-30',
        createdBy:
          'text-center shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] rounded-r-full w-[12%] px-5 text-body1_m_16 text-color-neutral-30'
      }}
      linked
    />
  )
}
