import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Notice } from '@/types/type'
import { columns } from './Columns'

interface Props {
  search: string
}

export default async function NoticeTable({ search }: Props) {
  const fixedNoticesFetcher: Promise<Notice[]> | Notice[] =
    search !== ''
      ? []
      : fetcher
          .get('notice', {
            searchParams: {
              fixed: 'true',
              take: '10'
            }
          })
          .json()

  const noticesFetcher: Promise<Notice[]> = fetcher
    .get('notice', {
      searchParams: {
        search,
        take: '10'
      }
    })
    .json()

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
      name="notice"
    />
  )
}
