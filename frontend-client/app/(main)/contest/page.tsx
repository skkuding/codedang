import DataTable from '@/components/DataTable'
import { auth } from '@/lib/auth'
import { fetcher, fetcherWithAuth } from '@/lib/utils'
import type { Contest } from '@/types/type'
import { columns } from './_components/Columns'
import ContestCardList from './_components/ContestCardList'
import TableSwitchButton from './_components/TableSwitchButton'

const getFinishedData = async () => {
  const data: {
    finished: Contest[]
  } = await fetcher.get('contest/finished?take=51').json()
  data.finished.forEach((contest) => {
    contest.status = 'finished'
  })
  return data.finished
}

const getAuthData = async () => {
  const data: {
    /* TODO: Add registeredFinised data */
    /* 현재 토큰 만료 시 오류 있음 */
    registeredOngoing: Contest[]
    registeredUpcoming: Contest[]
  } = await fetcherWithAuth.get('contest/auth').json()
  console.log(data)
  data.registeredOngoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.registeredUpcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })
  return data.registeredOngoing.concat(data.registeredUpcoming)
}

interface ContestProps {
  searchParams: { registered: string }
}

export default async function Contest({ searchParams }: ContestProps) {
  const session = await auth()
  const registered = searchParams?.registered ?? ''
  const contests =
    registered && session ? await getAuthData() : await getFinishedData()
  return (
    <>
      <div className="mb-12 flex flex-col gap-12">
        <ContestCardList type="Ongoing" />
        <ContestCardList type="Upcoming" />
      </div>
      {session?.user ? (
        <TableSwitchButton />
      ) : (
        <p className="w-fit text-xl font-bold text-gray-700 md:text-2xl ">
          Finished
        </p>
      )}
      {/* TODO: Add search bar */}

      <DataTable
        data={contests}
        columns={columns}
        headerStyle={{
          title: 'text-left w-2/4 md:w-4/6',
          status: 'w-1/4 md:w-1/6',
          startTime: 'w-1/4 md:w-1/6',
          endTime: 'w-1/4 md:w-1/6',
          participants: 'w-1/4 md:w-1/6'
        }}
        name="contest"
      />
    </>
  )
}
