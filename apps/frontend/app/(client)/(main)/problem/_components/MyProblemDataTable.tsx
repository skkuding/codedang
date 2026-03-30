'use client'

import { SearchBar } from '@/app/(client)/(main)/_components/SearchBar'
import { Button } from '@/components/shadcn/button'
import { Clock3, Filter, Microchip, Plus } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type { MyProblemCardItem } from './MyProblem'

interface MyProblemDataTableProps {
  data: MyProblemCardItem[]
  search: string
  hasMore: boolean
  onLoadMore: () => void
  emptyMessage?: string
}

export function MyProblemDataTable({
  data,
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
      <div className="flex w-full items-center justify-between self-stretch">
        <div className="flex shrink-0 items-center justify-start">
          <p className="text-head3_sb_28 whitespace-nowrap">내가 만든 문제</p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <Button
            variant="outline"
            className="border-line text-body1_m_16 text-color-neutral-70 h-12 min-w-28 justify-center rounded-full border px-5"
          >
            <Filter className="h-4 w-4" />
            State
          </Button>
          <SearchBar className="w-60" />
          <Button asChild className="text-body1_m_16 h-12 rounded-full px-6">
            <Link href="/problem/create">
              <Plus className="h-4 w-4" />새 문제 생성
            </Link>
          </Button>
        </div>
      </div>
      {data.length ? (
        <div className="mb-30 mt-5 grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {data.map((problem) => {
            const href =
              `${currentPath}/${problem.id}${search ? `?search=${search}` : ''}` as Route

            return (
              <Link
                key={problem.id}
                href={href}
                className="bg-background border-line outline-line inline-flex w-full flex-col items-start gap-5 rounded-2xl p-5 outline outline-1 outline-offset-[-1px] transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex w-full flex-col items-start gap-3">
                  <div className="inline-flex w-20 items-center justify-center gap-2.5 rounded bg-[#EDF4FF] px-2.5 py-1">
                    <span className="text-primary text-center text-xs font-medium leading-5">
                      {problem.state}
                    </span>
                  </div>
                  <p className="text-title1_sb_20 line-clamp-1 self-stretch">
                    {problem.title}
                  </p>
                </div>
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="inline-flex items-start justify-start gap-2 self-stretch">
                    <div className="flex items-center justify-start gap-1">
                      <Clock3 className="h-5 w-5" />
                      <span className="text-caption3_r_13">
                        {problem.timeLimit}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-start gap-1">
                      <Microchip className="h-5 w-5" />
                      <span className="text-caption3_r_13">
                        {problem.memoryLimit}MB
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-1">
                    <span className="text-caption3_r_13 justify-start text-right text-gray-400">
                      Last Modified:
                    </span>
                    <span className="text-caption3_r_13 justify-start text-right text-gray-500">
                      {problem.updatedAt}
                    </span>
                  </div>
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
