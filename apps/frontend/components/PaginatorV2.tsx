import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationNext,
  PaginationPrevious
} from '@/components/shadcn/pagination'
import { cn, getPageArray } from '@/libs/utils'
import type { ReactNode } from 'react'

export function Paginator({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <Pagination>
      <PaginationContent className={cn('py-2', className)}>
        {children}
      </PaginationContent>
    </Pagination>
  )
}

interface PageNavigationProps {
  currentPage: number
  firstPage: number
  lastPage: number
  gotoPage: (page: number) => void
}

export function PageNavigation({
  currentPage,
  firstPage,
  lastPage,
  gotoPage
}: PageNavigationProps) {
  return (
    <div className="flex items-center gap-1">
      {getPageArray(firstPage, lastPage).map((item) => (
        <PaginationButton
          key={item}
          isActive={currentPage === item}
          onClick={() => {
            gotoPage(item)
          }}
        >
          {item}
        </PaginationButton>
      ))}
    </div>
  )
}

type Direction = 'prev' | 'next'

export function SlotNavigation({
  direction,
  disabled,
  gotoSlot
}: {
  disabled: boolean
  gotoSlot: (dir: Direction) => void
  direction: Direction
}) {
  return direction === 'prev' ? (
    <PaginationPrevious
      onClick={() => {
        gotoSlot('prev')
      }}
      isActive={!disabled}
      disabled={disabled}
    />
  ) : (
    <PaginationNext
      onClick={() => {
        gotoSlot('next')
      }}
      isActive={disabled}
      disabled={!disabled}
    />
  )
}
