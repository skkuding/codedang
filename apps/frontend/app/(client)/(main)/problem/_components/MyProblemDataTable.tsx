'use client'

import { SearchBar } from '@/components/SearchBar'
import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import ClockGray from '@/public/icons/clock_gray.svg'
import Memory from '@/public/icons/memory.svg'
import PlusCircle from '@/public/icons/plus-circle-blue.svg'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { IoFilter } from 'react-icons/io5'
import type { MyProblemCardItem } from './MyProblem'

interface MyProblemDataTableProps {
  data: MyProblemCardItem[]
  search: string
}

const stateBadgeClassName = {
  Draft: {
    container: 'border border-line bg-color-neutral-99',
    text: 'text-color-neutral-70'
  },
  Ready: {
    container: 'border border-color-green-50 bg-white',
    text: 'text-color-green-40'
  },
  Published: {
    container: 'bg-[#EDF4FF]',
    text: 'text-primary'
  }
} as const

function getStateBadgeClassName(state: string) {
  if (state === 'Draft' || state === 'DRAFT') {
    return stateBadgeClassName.Draft
  }

  if (state === 'Ready' || state === 'READY') {
    return stateBadgeClassName.Ready
  }

  return stateBadgeClassName.Published
}

export function MyProblemDataTable({ data, search }: MyProblemDataTableProps) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full items-center justify-between self-stretch">
        <div className="flex shrink-0 items-center justify-start">
          <p className="text-head3_sb_28 whitespace-nowrap">내가 만든 문제</p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <Button
            variant="outline"
            className="border-line text-body1_m_16 h-[46px] min-w-28 justify-center rounded-full border px-5 py-[11px] text-black"
          >
            <IoFilter className="text-color-cool-neutral-30 mr-2 h-5 w-5" />
            State
          </Button>
          <SearchBar className="w-60" sizeVariant="lg" />
          <Button
            asChild
            className="text-body1_m_16 bg-primary h-[46px] shrink-0 whitespace-nowrap rounded-full px-[22px] py-2.5"
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
        <div className="mb-30 mt-5 grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.map((problem) => {
            const href =
              `/problem/my-problem/${problem.id}${search ? `?search=${search}` : ''}` as Route
            const badgeClassName = getStateBadgeClassName(problem.state)

            return (
              <Link
                key={problem.id}
                href={href}
                className="bg-background outline-color-cool-neutral-90 inline-flex w-full flex-col items-start gap-5 rounded-2xl p-5 outline outline-1 outline-offset-[-1px] transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex w-full flex-col items-start gap-3">
                  <div
                    className={cn(
                      'inline-flex items-center justify-center gap-2.5 rounded px-2.5 py-1',
                      badgeClassName.container
                    )}
                  >
                    <span
                      className={cn(
                        'text-caption1_m_13 text-center',
                        badgeClassName.text
                      )}
                    >
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
                    <span className="text-caption3_r_13 text-color-neutral-90 justify-start text-right">
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
        <MyProblemEmptyState />
      )}
    </div>
  )
}

function MyProblemEmptyState() {
  return (
    <div className="border-line mb-30 mt-5 flex h-[266px] w-full items-center justify-center rounded-xl border bg-white py-20">
      <div className="flex flex-col items-center gap-[16px] text-center">
        <p className="text-sub1_sb_18 text-color-neutral-30">
          내가 만든 문제가
          <br />
          존재하지 않습니다.
        </p>
        <Button
          asChild
          className="text-sub4_sb_14 bg-primary h-10 shrink-0 whitespace-nowrap rounded-lg px-3 py-2.5"
        >
          <Link href="/problem/create">새 문제 생성하기</Link>
        </Button>
      </div>
    </div>
  )
}
