import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

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
    goto: (direction: 'prev' | 'next', setUrl: (url: URL) => void) => void
  }
  setUrl: (url: URL) => void
}

export default function Paginator({ page, slot, setUrl }: Props) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationPrevious
          onClick={() => {
            slot.goto('prev', setUrl)
          }}
          className={slot.prev ? '' : 'cursor-not-allowed opacity-30'}
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
            slot.goto('next', setUrl)
          }}
          className={slot.next ? '' : 'cursor-not-allowed opacity-30'}
        />
      </PaginationContent>
    </Pagination>
  )
}
