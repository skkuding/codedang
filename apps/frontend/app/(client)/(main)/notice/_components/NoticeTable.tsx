import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcher } from '@/libs/utils'
import { getTranslate } from '@/tolgee/server'
import type { Notice } from '@/types/type'
import { columns } from './Columns'

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
  const t = await getTranslate()

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
    <DataTable
      data={currentPageData}
      columns={columns(t)}
      headerStyle={{
        title: 'text-left w-2/4 md:w-4/6',
        createdBy: 'w-1/4 md:w-1/6',
        createTime: 'w-1/4 md:w-1/6'
      }}
      linked
    />
  )
}
