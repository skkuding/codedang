import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationNext,
  PaginationPrevious
} from '@/components/shadcn/pagination'
import { cn, getPageArray } from '@/libs/utils'
import type { ReactNode } from 'react'

interface PaginatorProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function Paginator({
  children,
  className,
  contentClassName
}: PaginatorProps) {
  return (
    <Pagination className={className}>
      <PaginationContent
        className={cn('flex items-center gap-[10px] py-2', contentClassName)}
      >
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
  className?: string
  spacerClassName?: string
}

export function SlotNavigation({
  direction,
  gotoSlot,
  disabled,
  className,
  spacerClassName
}: SlotNavigationProps) {
  return direction === 'prev' ? (
    <>
      <PaginationPrevious
        onClick={() => {
          gotoSlot('prev')
        }}
        isActive={!disabled}
        disabled={disabled}
        className={className}
      />
      <div className={cn('w-[26px]', spacerClassName)} />
    </>
  ) : (
    <>
      <div className={cn('w-[26px]', spacerClassName)} />
      <PaginationNext
        onClick={() => {
          gotoSlot('next')
        }}
        isActive={!disabled}
        disabled={disabled}
        className={className}
      />
    </>
  )
}

interface PageNavigationProps {
  firstPage: number
  lastPage: number
  currentPage: number
  gotoPage: (page: number) => void
  buttonClassName?: string
  activeButtonClassName?: string
  inactiveButtonClassName?: string
}

export function PageNavigation({
  firstPage,
  lastPage,
  currentPage,
  gotoPage,
  buttonClassName,
  activeButtonClassName,
  inactiveButtonClassName
}: PageNavigationProps) {
  return (
    <>
      {getPageArray(firstPage, lastPage).map((item) => (
        <PaginationButton
          key={item}
          isActive={currentPage === item}
          className={cn(
            buttonClassName,
            currentPage === item
              ? activeButtonClassName
              : inactiveButtonClassName
          )}
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
