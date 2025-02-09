import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import { columns } from './RegisteredTableColumns'

const getContests = async (search: string) => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
    finished: Contest[]
  } = await fetcherWithAuth
    .get('contest', {
      searchParams: {
        search
      }
    })
    .json()
  data.ongoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })
  data.finished.forEach((contest) => {
    contest.status = 'finished'
  })
  return data.ongoing.concat(data.upcoming).concat(data.finished)
}

export async function RegisteredContestTable({ search }: { search: string }) {
  const data = await getContests(search)

  return (
    <DataTable
      data={data}
      columns={columns}
      headerStyle={{
        title: 'text-left w-2/5 md:w-1/2',
        status: 'w-1/5 md:w-1/6',
        participants: 'w-1/5 md:w-1/6',
        period: 'w-1/5 md:w-1/3'
      }}
      linked
    />
  )
}
