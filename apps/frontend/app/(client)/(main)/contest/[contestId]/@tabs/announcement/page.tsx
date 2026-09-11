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
    <div className="w-[1208px] pb-[120px]">
      <p className="my-20 text-left text-2xl font-semibold">ANNOUNCEMENT</p>
      <DataTable
        data={contestAnnouncements}
        columns={columns}
        headerStyle={{
          no: 'text-[#808080b3] font-normal w-[109px]',
          problem: 'text-[#808080b3] font-normal w-[181px]',
          content: 'text-[#808080b3] font-normal w-[616px]',
          createTime: 'text-[#808080b3] font-normal w-[302px]'
        }}
        tableRowStyle="hover:bg-white cursor-auto"
      />
    </div>
  )
}
