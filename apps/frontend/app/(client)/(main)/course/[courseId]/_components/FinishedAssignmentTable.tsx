import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import type { Session } from 'next-auth'
import { columns } from '../../_components/FinishedTableColumns'

interface AssignmentProps {
  data: Assignment[]
}

export async function FinishedAssignmentTable({
  session
}: {
  session: Session | null
}) {
  const AssignmentData: AssignmentProps = await (
    session ? fetcherWithAuth : fetcher
  )
    .get('assignment/finished', {
      searchParams: {
        take: '51'
      }
    })
    .json()

  AssignmentData.data.forEach((assignment) => {
    assignment.status = 'finished'
  })

  return (
    <DataTable
      data={AssignmentData.data}
      columns={columns}
      headerStyle={{
        title: 'text-left w-2/5 md:w-1/2',
        registered: 'w-1/5 md:w-1/6',
        participants: 'w-1/5 md:w-1/6',
        period: 'w-1/5 md:w-1/3'
      }}
      linked
    />
  )
}
