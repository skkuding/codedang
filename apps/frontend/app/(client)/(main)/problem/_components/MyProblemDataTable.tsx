'use client'

import { SearchBar } from '@/app/(client)/(main)/_components/SearchBar'
import { Button } from '@/components/shadcn/button'
import ClockGray from '@/public/icons/clock_gray.svg'
import Memory from '@/public/icons/memory.svg'
import PlusCircle from '@/public/icons/plus-circle-blue.svg'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoFilter } from 'react-icons/io5'
import type { MyProblemCardItem } from './MyProblem'

interface MyProblemDataTableProps {
  data: MyProblemCardItem[]
  search: string
  emptyMessage?: string
}

export function MyProblemDataTable({
  data,
  search,
  emptyMessage = 'No results.'
}: MyProblemDataTableProps) {
  const currentPath = usePathname()

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full items-center justify-between self-stretch">
        <div className="flex shrink-0 items-center justify-start">
          <p className="text-head3_sb_28 whitespace-nowrap">내가 만든 문제</p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <Button
            variant="outline"
            className="border-line text-body1_m_16 h-12 min-w-28 justify-center rounded-full border px-5"
          >
            <IoFilter className="mr-2 h-5 w-5" />
            State
          </Button>
          <SearchBar className="w-60" />
          <Button
            asChild
            className="text-body1_m_16 bg-primary h-12 shrink-0 whitespace-nowrap rounded-full px-5 py-2.5"
          >
            <Link
              href="/problem/create"
              className="flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Image
                src={PlusCircle}
                alt="plus circle"
                width={20}
                height={20}
              />
              새 문제 생성
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
                      <Image
                        src={ClockGray}
                        alt="clock gray"
                        width={20}
                        height={20}
                      />
                      <span className="text-caption3_r_13">
                        {problem.timeLimit}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-start gap-1">
                      <Image src={Memory} alt="memory" width={20} height={20} />
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
