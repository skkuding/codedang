import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcher } from '@/libs/utils'
import type { ContestAnnouncement } from '@/types/type'
import { columns } from './_components/Columns'

interface ContestAnnouncementProps {
  params: Promise<{ contestId: string }>
}

export default async function ContestAnnouncement(
  props: ContestAnnouncementProps
) {
  const { contestId } = await props.params
  const contestAnnouncements: ContestAnnouncement[] = await fetcher
    .get('announcement', {
      searchParams: {
        contestId
      }
    })
    .json()
  return (
    <div className="pb-[120px]">
      <p className="my-20 text-left text-2xl font-semibold">ANNOUNCEMENT</p>
      <DataTable
        data={contestAnnouncements}
        columns={columns}
        headerStyle={{
          no: 'text-[#808080b3] font-normal w-[9%]',
          problem: 'text-[#808080b3] font-normal w-[15%]',
          content: 'text-[#808080b3] font-normal w-[51%]',
          createTime: 'text-[#808080b3] font-normal w-[25%]'
        }}
        tableRowStyle="hover:bg-white cursor-auto"
      />
    </div>
  )
}
