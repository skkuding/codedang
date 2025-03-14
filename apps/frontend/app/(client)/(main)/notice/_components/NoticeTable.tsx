import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcher } from '@/libs/utils'
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
  const fixedNoticesFetcher: Promise<Notice[]> | Notice[] =
    search !== '' ? [] : getFixedNotices()

  const noticesFetcher: Promise<Notice[]> = getNotices(search)

  const [fixedNotices, notices] = await Promise.all([
    fixedNoticesFetcher,
    noticesFetcher
  ])

  const currentPageData = fixedNotices.concat(notices)

  return (
    <DataTable
      data={currentPageData}
      columns={columns}
      headerStyle={{
        title: 'text-left w-2/4 md:w-4/6',
        createdBy: 'w-1/4 md:w-1/6',
        createTime: 'w-1/4 md:w-1/6'
      }}
      linked
    />
  )
}
