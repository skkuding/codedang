import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import { columns } from './_components/Columns'
import { Notice } from '@/types/type'

export default async function Notice() {
  const fixedData:Notice[] = await fetcher.get('notice?fixed=true&take=10').json()
  const data:Notice[] = await fetcher.get('notice?take=10').json()
  const currentPageData = fixedData.concat(data)

  return (
    <>
      {/* TODO: Add search bar */}
      <DataTable data={currentPageData} columns={columns} headerStyle={{
        title: 'w-2/4 md:w-4/6',
        createdBy: 'text-center w-1/4 md:w-1/6',
        createTime: 'text-center w-1/4 md:w-1/6'
      }}/>
    </>
  )
}
