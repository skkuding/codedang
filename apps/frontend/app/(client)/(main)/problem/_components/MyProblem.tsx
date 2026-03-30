'use client'

import { Skeleton } from '@/components/shadcn/skeleton'
import type { Problem } from '@/types/type'
import { useSearchParams } from 'next/navigation'
import { MyProblemDataTable } from './MyProblemDataTable'

export interface MyProblemCardItem extends Problem {
  state: 'ONGOING' | 'DRAFT' | 'REVIEW'
  thumbnailSrc: string
  timeLimit: number
  memoryLimit: number
  updatedAt: string
}

const MOCK_MY_PROBLEMS: MyProblemCardItem[] = Array.from(
  { length: 48 },
  (_, index) => {
    const id = 3000 + index + 1
    const difficulty = `Level${(index % 5) + 1}` as Problem['difficulty']
    const submissionCount = 24 + index * 7
    const acceptedRate = ((index % 9) + 2) / 12
    const states: MyProblemCardItem['state'][] = ['ONGOING', 'DRAFT', 'REVIEW']

    return {
      id,
      title: `글자 수 상관 없음. 단, 한 줄로만 노출되는 Mock My Problem ${index + 1}`,
      difficulty,
      submissionCount,
      acceptedRate,
      tags: [],
      languages: ['C', 'Cpp', 'Java', 'Python3'],
      hasPassed: null,
      state: states[index % states.length],
      thumbnailSrc: '/banners/problemInnerBanner.png',
      timeLimit: 1000 + (index % 4) * 500,
      memoryLimit: 128 + (index % 3) * 64,
      updatedAt: `2024-01-${String((index % 24) + 1).padStart(2, '0')} 19:00`
    }
  }
)

export function MyProblem() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const normalizedSearch = search.trim().toLowerCase()

  const filteredProblems = MOCK_MY_PROBLEMS.filter((problem) => {
    if (!normalizedSearch) {
      return true
    }

    return (
      problem.title.toLowerCase().includes(normalizedSearch) ||
      String(problem.id).includes(normalizedSearch)
    )
  })

  return (
    <MyProblemDataTable
      data={filteredProblems}
      search={search}
      emptyMessage="아직 만든 문제가 없습니다."
    />
  )
}

export function MyProblemFallback() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-28 rounded-full" />
          <Skeleton className="h-12 w-72 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="border-line overflow-hidden rounded-[24px] border"
          >
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="space-y-4 p-5">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-full rounded-md" />
              <Skeleton className="h-6 w-2/3 rounded-md" />
              <Skeleton className="h-5 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
