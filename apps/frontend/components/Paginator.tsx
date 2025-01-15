import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationNext,
  PaginationPrevious
} from '@/components/shadcn/pagination'

interface Props {
  page: {
    current: number
    first: number
    count: number
    goto: (page: number) => void
  }
  slot: {
    prev: string
    next: string
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
          isActive={Boolean(slot.prev)}
        />
        <div className="flex items-center gap-1">
          {Array.from({ length: page.count }).map((_, i) => {
            i += page.first
            return (
              <PaginationButton
                key={i}
                isActive={page.current === i}
                onClick={() => {
                  page.goto(i)
                }}
              >
                {i}
              </PaginationButton>
            )
          })}
        </div>
        <PaginationNext
          onClick={() => {
            slot.goto('next')
          }}
          isActive={Boolean(slot.next)}
        />
      </PaginationContent>
    </Pagination>
  )
}
