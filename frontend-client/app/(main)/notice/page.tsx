'use client'

import Paginator from '@/components/Paginator'
import { usePagination } from '@/lib/usePagination'
import { fetcher } from '@/lib/utils'
import { baseUrl } from '@/lib/vars'
import type { Notice } from '@/types/type'
import { useEffect, useRef, useState } from 'react'
import NoticeTable from './_components/NoticeTable'

export default function Notice() {
  const fixed = useRef<Notice[]>([])
  useEffect(() => {
    ;(async () => {
      fixed.current = await fetcher<Notice[]>('/notice/fixed?take=10')
    })()
  }, [])

  const [url, setUrl] = useState<URL>(new URL('/notice', baseUrl))
  const { items, paginator } = usePagination<Notice>(url)
  const notices = fixed.current.concat(items ?? [])

  return (
    <>
      {/* TODO: Add search bar */}
      <NoticeTable data={notices} isLoading={!items} />
      <Paginator page={paginator.page} slot={paginator.slot} setUrl={setUrl} />
    </>
  )
}
export const runtime = 'edge'
