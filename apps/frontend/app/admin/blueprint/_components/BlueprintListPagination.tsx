'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { FaCirclePlay } from 'react-icons/fa6'

interface BlueprintListPaginationProps {
  kind: 'assignments' | 'exercises'
  page: number
  pageSize: number
  selectedCount: number
  currentPageCount: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
  onPageSizeChange: (pageSize: number) => void
}

export function BlueprintListPagination({
  kind,
  page,
  pageSize,
  selectedCount,
  currentPageCount,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onPageSizeChange
}: BlueprintListPaginationProps) {
  const pageSizes = [...new Set([10, 20, 30, 40, 50, pageSize])].sort(
    (first, second) => first - second
  )

  return (
    <div className="@container">
      <div className="@min-[640px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-2">
        <p
          role="status"
          className="col-start-1 row-start-1 text-xs text-neutral-600"
        >
          {selectedCount} of {currentPageCount} selected on this page
        </p>

        <nav
          aria-label={`${kind} pages`}
          className="@min-[640px]:col-span-1 @min-[640px]:col-start-2 @min-[640px]:row-start-1 col-span-2 col-start-1 row-start-2 flex min-w-0 items-center gap-[30px] justify-self-center"
        >
          <button
            type="button"
            aria-label="Previous"
            disabled={!hasPrevious}
            onClick={onPrevious}
            className="focus-visible:outline-primary relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:text-neutral-300"
          >
            {!hasPrevious && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#C4C4C4]"
              />
            )}
            <FaCirclePlay
              aria-hidden="true"
              color={hasPrevious ? '#3581FA' : '#EBEBEB'}
              className="relative z-10 h-full w-full rotate-180"
            />
          </button>

          <span
            aria-current="page"
            aria-label={`Page ${page}`}
            className="text-body1_m_16 text-primary-strong flex h-10 min-w-[42px] items-center justify-center p-2"
          >
            {page}
          </span>

          <button
            type="button"
            aria-label="Next"
            disabled={!hasNext}
            onClick={onNext}
            className="focus-visible:outline-primary relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:text-neutral-300"
          >
            {!hasNext && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#C4C4C4]"
              />
            )}
            <FaCirclePlay
              aria-hidden="true"
              color={hasNext ? '#3581FA' : '#EBEBEB'}
              className="relative z-10 h-full w-full"
            />
          </button>
        </nav>

        <div className="@min-[640px]:col-start-3 col-start-2 row-start-1 flex items-center space-x-2 justify-self-end">
          <span className="text-xs text-neutral-600">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              aria-label="Rows per page"
              className="h-6 w-14 bg-white py-0 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top" className="bg-white">
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
