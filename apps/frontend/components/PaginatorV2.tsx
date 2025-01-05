import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationNext,
  PaginationPrevious
} from '@/components/shadcn/pagination'
import { getPageArray } from '@/libs/utils'
import type { ReactNode } from 'react'

interface PaginatorProps {
  children: ReactNode
}

export function Paginator({ children }: PaginatorProps) {
  return (
    <Pagination>
      <PaginationContent className="flex items-center gap-1 py-2">
        {children}
      </PaginationContent>
    </Pagination>
  )
}

type Direction = 'prev' | 'next'
interface SlotNavigationProps {
  direction: Direction
  disabled: boolean
  gotoSlot: (dir: Direction) => void
}

export function SlotNavigation({
  direction,
  gotoSlot,
  disabled
}: SlotNavigationProps) {
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
      isActive={!disabled}
      disabled={disabled}
    />
  )
}

interface PageNavigationProps {
  firstPage: number
  lastPage: number
  currentPage: number
  gotoPage: (page: number) => void
}

export function PageNavigation({
  firstPage,
  lastPage,
  currentPage,
  gotoPage
}: PageNavigationProps) {
  return (
    <>
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
    </>
  )
}
