import DataTable from '@/components/DataTable'
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
    <DataTable
      data={contestAnnouncements}
      columns={columns}
      headerStyle={{
        problem: 'w-[12%]',
        content: 'w-[70%]',
        updateTime: 'w-[18%]'
      }}
    />
  )
}
