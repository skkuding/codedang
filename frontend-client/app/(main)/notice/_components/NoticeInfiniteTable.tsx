'use client'

import DataTable from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { useInfiniteScroll } from '@/lib/useInfiniteScroll'
import { fetcher } from '@/lib/utils'
import { baseUrl } from '@/lib/vars'
import type { Notice } from '@/types/type'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ClipLoader from 'react-spinners/ClipLoader'
import { columns } from './Columns'

export default function NoticeInfiniteTable() {
  const searchParam = useSearchParams()
  const search = searchParam.get('search')
  const url = new URL('/notice', baseUrl)
  if (search) {
    url.searchParams.set('search', search)
  }

  const [fixedNotices, setFixedNotices] = useState<Notice[]>([])
  const [isLoadingFixedData, setIsLoadingFixedData] = useState(true)

  useEffect(() => {
    const fetchFixedNotices = async () => {
      try {
        const data: Notice[] = await fetcher
          .get('notice', {
            searchParams: {
              fixed: 'true'
            }
          })
          .json()
        setFixedNotices(data)
      } catch (error) {
        console.error('Error fetching fixed notices:', error)
      } finally {
        setIsLoadingFixedData(false) // 페칭이 완료되면 상태 업데이트
      }
    }
    fetchFixedNotices()
  }, [])

  const {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    ref,
    scrollCounter
  } = useInfiniteScroll<Notice>('notice', url) //infinite scroll
  const notices = [...fixedNotices, ...items]

  return (
    <div className="flex flex-col items-center">
      {isLoadingFixedData ? (
        <ClipLoader />
      ) : (
        <DataTable
          data={notices}
          columns={columns}
          headerStyle={{
            title: 'text-left w-2/4 md:w-4/6',
            createdBy: 'w-1/4 md:w-1/6',
            createTime: 'w-1/4 md:w-1/6'
          }}
          name="notice"
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
  )
}
