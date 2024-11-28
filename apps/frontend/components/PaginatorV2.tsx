import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationNext,
  PaginationPrevious
} from '@/components/shadcn/pagination'
import { getPageArray } from '@/libs/utils'

interface Props {
  page: {
    current: number
    first: number
    count: number
    goto: (page: number) => void
  }
  slot: {
    prev: boolean
    next: boolean
    goto: (direction: 'prev' | 'next') => void
  }
}

export default function Paginator({ page, slot }: Props) {
  return (
    <Pagination className="py-2">
      <PaginationContent>
        <PaginationPrevious
          onClick={() => {
            slot.goto('prev')
          }}
          isActive={slot.prev}
          disabled={!slot.prev}
        />
        <div className="flex items-center gap-1">
          {getPageArray(page.first, page.first + page.count - 1).map((item) => (
            <PaginationButton
              key={item}
              isActive={page.current === item}
              onClick={() => {
                page.goto(item)
              }}
            >
              {item}
            </PaginationButton>
          ))}
        </div>
        <PaginationNext
          onClick={() => {
            slot.goto('next')
          }}
          isActive={slot.next}
          disabled={!slot.next}
        />
      </PaginationContent>
    </Pagination>
  )
}
