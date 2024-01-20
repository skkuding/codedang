import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Notice } from '@/types/type'
import { columns } from './_components/Columns'

export default async function Notice() {
  const fixedData: Notice[] = await fetcher
    .get('notice', {
      searchParams: {
        fixed: 'true',
        take: '10'
      }
    })
    .json()
  const data: Notice[] = await fetcher.get('notice?take=10').json()
  const currentPageData = fixedData.concat(data)

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
