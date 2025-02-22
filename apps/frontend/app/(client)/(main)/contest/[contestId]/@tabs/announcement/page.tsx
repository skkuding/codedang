import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcher } from '@/libs/utils'
import type { ContestAnnouncement } from '@/types/type'
import { columns } from './_components/Columns'

interface ContestAnnouncementProps {
  params: { contestId: string }
}

export default async function ContestAnnouncement({
  params
}: ContestAnnouncementProps) {
  const { contestId } = params
  const contestAnnouncements: ContestAnnouncement[] = await fetcher
    .get('announcement', {
      searchParams: {
        contestId
      }
    })
    .json()
  return (
    <div className="pb-[120px]">
      <p className="mb-20 mt-20 text-center text-2xl font-semibold text-[#3581FA]">
        ANNOUNCEMENT
      </p>
      <DataTable
        data={contestAnnouncements}
        columns={columns}
        headerStyle={{
          no: 'text-[#808080b3] font-normal w-[9%]',
          problem: 'text-[#808080b3] font-normal w-[15%]',
          content: 'text-[#808080b3] font-normal w-[51%]',
          createTime: 'text-[#808080b3] font-normal w-[25%]'
        }}
        tableStyle="hover:bg-white cursor-auto"
      />
    </div>
  )
}
