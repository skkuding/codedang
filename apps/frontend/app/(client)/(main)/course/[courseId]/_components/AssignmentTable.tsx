import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import type { Session } from 'next-auth'
import { columns } from '../../_components/AssgimentTableColumns'

interface AssignmentProps {
  data: Assignment[]
}

export async function AssignmentTable({
  session
}: {
  session: Session | null
}) {
  const AssignmentData: AssignmentProps = await (
    session ? fetcherWithAuth : fetcher
  )
    .get('assignment/finished', {
      //FIX: 경로를 모든 assignment를 가져오도록 바꿔주어야한다.
      //현재 데이터가 가져와지는게 저 엔드포인트여서 임시방편으로 지정함.
      searchParams: {
        take: '51'
      }
    })
    .json()

  return (
    <DataTable //이걸 각 Row마다 토글이 가능하도록 수정을 하거나 해야할 것 같음.
      data={AssignmentData.data}
      columns={columns}
      headerStyle={{
        week: 'text-left w-2/5 md:w-1/2',
        startDate: 'w-1/5 md:w-1/6',
        endDate: 'w-1/5 md:w-1/6',
        progress: 'w-1/5 md:w-1/3'
      }}
      linked
    />
  )
}
