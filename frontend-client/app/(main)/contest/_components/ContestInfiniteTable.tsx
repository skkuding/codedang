'use client'

import DataTable from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { fetcherWithAuth } from '@/lib/utils'
import { baseUrl } from '@/lib/vars'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'
import { useEffect, useState } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import { columns } from './Columns'

interface ContestInfiniteTableProps {
  search: string
  registered: string
  session: Session | null
}

export default function ContestInfiniteTable({
  search,
  registered,
  session
}: ContestInfiniteTableProps) {
  const url = new URL('/contest/registered-finished', baseUrl)
  url.searchParams.set('search', search)
  url.searchParams.set('registered', registered)

  const [ongoingUpcoming, setOngoingUpcoming] = useState<Contest[]>([])

  useEffect(() => {
    if (registered) {
      const fetchOngoingUpcomingContests = async () => {
        try {
          const data: {
            registeredOngoing: Contest[]
            registeredUpcoming: Contest[]
          } = await fetcherWithAuth
            .get('contest/registered-ongoing-upcoming', {
              searchParams: {
                search
              }
            })
            .json()
          data.registeredOngoing.forEach((contest) => {
            contest.status = 'ongoing'
          })
          data.registeredUpcoming.forEach((contest) => {
            contest.status = 'upcoming'
          })
          setOngoingUpcoming(
            data.registeredOngoing.concat(data.registeredUpcoming)
          )
        } catch (error) {
          console.error('Error fetching', error)
        }
      }
      fetchOngoingUpcomingContests()
    }
  }, [search, registered])

  const {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    ref,
    isLoading,
    scrollCounter
  } = useInfiniteScroll<Contest>('contest', url, 10, session)

  const contests =
    registered && session ? [...ongoingUpcoming, ...items] : items

  return (
    <>
      <div className="flex flex-col items-center">
        {isLoading ? (
          <ClipLoader />
        ) : (
          <DataTable
            data={contests}
            columns={columns}
            headerStyle={{
              title: 'text-left w-2/5 md:w-3/6',
              startTime: 'w-1/5 md:w-1/6',
              endTime: 'w-1/5 md:w-1/6',
              participants: 'w-1/5 md:w-1/6',
              status: 'w-1/4 md:w-1/6'
            }}
            name="contest"
          />
        )}
        {isFetchingNextPage && hasNextPage && <ClipLoader />}
        {!isFetchingNextPage && hasNextPage && scrollCounter.current >= 5 && (
          <Button onClick={() => fetchNextPage()} className="w-40">
            Load More
          </Button>
        )}
        <div ref={ref} />
      </div>
    </>
  )
}
