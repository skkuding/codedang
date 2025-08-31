import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { cn } from '@/libs/utils'
import { TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons'
import type { Column } from '@tanstack/react-table'

const VISIBLE_COLUMN_TITLE = 'Visible'
interface DataTableColumnHeaderProps<TData, TValue>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  column: Column<TData, TValue>
  title: typeof VISIBLE_COLUMN_TITLE | (string & NonNullable<unknown>)
}

/**
 * 어드민 테이블의 컬럼 헤더 컴포넌트
 * @param column
 * 컬럼 정보가 담긴 객체
 * @param title
 * 헤더에 표시할 텍스트
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  // Title column
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          'text-center text-sm font-normal text-[#8A8A8A]',
          className
        )}
      >
        {title}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full justify-center">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'data-[state=open]:bg-accent flex h-8 justify-center text-neutral-400',
                column.getIsSorted() ? 'text-black' : ''
              )}
              onClick={() => {
                // 다중 정렬 유지
                column.toggleSorting(column.getIsSorted() === 'desc', true)
              }}
            >
              <span className="text-sm font-normal text-[#8A8A8A]">
                {title}
              </span>
              {(() => {
                const sort = column.getIsSorted()
                if (sort === 'desc') {
                  return <TriangleDownIcon className="ml-2 h-4 w-4" />
                }
                if (sort === 'asc') {
                  return <TriangleUpIcon className="ml-2 h-4 w-4" />
                }
                return (
                  <div>
                    <TriangleUpIcon className="-mb-2.5 ml-2 h-4 w-4" />
                    <TriangleDownIcon className="-mt- ml-2 h-4 w-4" />
                  </div>
                )
              })()}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false, true)}>
            <TriangleUpIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {title === VISIBLE_COLUMN_TITLE ? 'Hidden first' : 'Asc'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true, true)}>
            <TriangleDownIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {title === VISIBLE_COLUMN_TITLE ? 'Visible first' : 'Desc'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
