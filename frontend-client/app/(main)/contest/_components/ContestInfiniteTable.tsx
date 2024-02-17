'use client'

import DataTable from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { fetcherWithAuth } from '@/lib/utils'
import { baseUrl } from '@/lib/vars'
import type { Contest } from '@/types/type'
import { useEffect, useState } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import { columns } from './Columns'

export default function ContestInfiniteTable({ search }: { search: string }) {
  const url = new URL('/contest/registered-finished', baseUrl)
  if (search) {
    url.searchParams.set('search', search)
  }

  const [ongoingUpcoming, setOngoingUpcoming] = useState<Contest[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
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
      } finally {
        setIsLoadingData(false)
        console.log(ongoingUpcoming)
      }
    }
    fetchOngoingUpcomingContests()
  }, [search])

  const {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    ref,
    scrollCounter
  } = useInfiniteScroll<Contest>('contest', url)
  const contests = [...ongoingUpcoming, ...items]

  return (
    <>
      <p className="text-xl font-bold md:text-2xl">Registered</p>
      <div className="flex flex-col items-center">
        {isLoadingData ? (
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
