import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { ContestAnnouncement } from '@/types/type'
import { columns } from './_components/Columns'

interface ContestAnnouncementProps {
  params: { id: string }
}

export default async function ContestAnnouncement({
  params
}: ContestAnnouncementProps) {
  const { id } = params
  const contestAnnouncements: ContestAnnouncement[] = await fetcher
    .get('announcement', {
      searchParams: {
        contestId: id
      }
    })
    .json()

  return (
    <DataTable
      data={contestAnnouncements}
      columns={columns}
      headerStyle={{
        problem: 'w-[12%]',
        content: 'w-[70%]',
        updateTime: 'w-[18%]'
      }}
      name=""
    />
  )
}
