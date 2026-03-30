'use client'

import { SearchBar } from '@/app/(client)/(main)/_components/SearchBar'
import { Button } from '@/components/shadcn/button'
import { Clock3, Filter, Microchip, Plus } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import type { MyProblemCardItem } from './MyProblem'

interface MyProblemDataTableProps {
  data: MyProblemCardItem[]
  total: number
  search: string
  hasMore: boolean
  onLoadMore: () => void
  emptyMessage?: string
}

export function MyProblemDataTable({
  data,
  total,
  search,
  hasMore,
  onLoadMore,
  emptyMessage = 'No results.'
}: MyProblemDataTableProps) {
  const currentPath = usePathname()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = loadMoreRef.current

    if (!node || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin: '160px 0px' }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, onLoadMore, data.length])

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center justify-start gap-2">
            <p className="text-head3_sb_28">내가 만든 문제</p>
            <p className="text-head3_sb_28 text-primary">{total}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <Button
            variant="outline"
            className="border-line text-body1_m_16 text-color-neutral-70 h-12 min-w-28 justify-center rounded-full border px-5"
          >
            <Filter className="h-4 w-4" />
            State
          </Button>
          <SearchBar className="w-full lg:w-72" />
          <Button asChild className="text-body1_m_16 h-12 rounded-full px-6">
            <Link href="/admin/problem/create">
              <Plus className="h-4 w-4" />새 문제 생성
            </Link>
          </Button>
        </div>
      </div>
      {data.length ? (
        <div className="mt-5 grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.map((problem) => {
            const href =
              `${currentPath}/${problem.id}${search ? `?search=${search}` : ''}` as Route

            return (
              <Link
                key={problem.id}
                href={href}
                className="border-line group overflow-hidden rounded-[24px] border bg-white transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="bg-color-neutral-95 relative h-40 w-full overflow-hidden">
                  <Image
                    src={problem.thumbnailSrc}
                    alt={problem.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-primary bg-[#EDF4FF] px-3 py-1 text-[14px] font-medium">
                      {problem.state}
                    </span>
                    <span className="text-body3_r_16 text-color-cool-neutral-40">
                      {problem.difficulty}
                    </span>
                  </div>
                  <div>
                    <p className="text-body1_m_16 text-color-neutral-90 overflow-hidden text-ellipsis whitespace-nowrap">
                      {problem.title}
                    </p>
                  </div>
                  <div className="text-body3_r_16 text-color-neutral-80 flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="text-color-cool-neutral-40 h-4 w-4" />
                      {problem.timeLimit}ms
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Microchip className="text-color-cool-neutral-40 h-4 w-4" />
                      {problem.memoryLimit}MB
                    </span>
                  </div>
                  <p className="text-body3_r_16 text-color-cool-neutral-40">
                    Last Modified: {problem.updatedAt}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="border-line text-color-cool-neutral-40 mt-5 flex h-60 w-full items-center justify-center rounded-[24px] border text-center">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}
