import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons'
import type { Column } from '@tanstack/react-table'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className
}: DataTableColumnHeaderProps<TData, TValue>) {
  // Title column
  if (!column.getCanSort()) {
    return (
      <div className={cn('w-[330px] text-left font-mono text-sm', className)}>
        {title}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2 font-mono', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'data-[state=open]:bg-accent ml-3 flex h-8 justify-center text-neutral-400',
              column.getIsSorted() ? 'text-black' : ''
            )}
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <TriangleDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <TriangleUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <div>
                <TriangleUpIcon className="-mb-2.5 ml-2 h-4 w-4" />
                <TriangleDownIcon className="-mt- ml-2 h-4 w-4" />
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <TriangleUpIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {title === 'Visible' ? 'Hidden first' : 'Asc'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <TriangleDownIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {title === 'Visible' ? 'Visible first' : 'Desc'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
