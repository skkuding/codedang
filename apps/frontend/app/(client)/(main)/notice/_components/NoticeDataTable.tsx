'use client'

import { SearchBar } from '@/app/(client)/(main)/_components/SearchBar'
import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IoChevronDownOutline } from 'react-icons/io5'

interface Item {
  id: number | string
  createTime?: string
  isFixed?: boolean
}

interface NoticeDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  headerStyle: {
    [key: string]: string
  }
  linked?: boolean
  emptyMessage?: string
}

function DateSortDropdown() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const sortOrder = searchParams.get('sort')

  const handleSelect = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('sort', value)
    router.push(`${pathname}?${newParams.toString()}` as Route, {
      scroll: false
    })
  }

  const labelMap: Record<string, string> = { asc: 'Asc', desc: 'Desc' }
  const label = (sortOrder && labelMap[sortOrder]) || 'State'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-auto rounded-full border border-neutral-200 px-5 py-[11px] font-semibold text-black hover:bg-gray-50"
        >
          <p className="text-base font-medium">{label}</p>
          <IoChevronDownOutline className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[100px]">
        <DropdownMenuItem onClick={() => handleSelect('asc')}>
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('desc')}>
          Desc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function NoticeDataTable<TData extends Item, TValue>({
  columns,
  data,
  headerStyle,
  linked = false,
  emptyMessage = 'No results.'
}: NoticeDataTableProps<TData, TValue>) {
  const searchParams = useSearchParams()
  const sortOrder = searchParams.get('sort') ?? 'desc'

  const sortedData = [...data].sort((a, b) => {
    if (a.isFixed && !b.isFixed) {
      return -1
    }
    if (!a.isFixed && b.isFixed) {
      return 1
    }
    const aTime = new Date(a.createTime ?? '').getTime()
    const bTime = new Date(b.createTime ?? '').getTime()
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
  })

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel()
  })
  const router = useRouter()
  const currentPath = usePathname()

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mt-15 mb-5 flex w-full items-center justify-between">
        <p className="text-head3_sb_28">전체 공지 리스트</p>
        <div className="flex items-center gap-2">
          <DateSortDropdown />
          <SearchBar className="w-60 [&_input]:h-[46px] [&_svg]:!top-[calc(50%-8px)]" />
        </div>
      </div>
      <div className="bg-background border-line mb-10 w-full overflow-hidden rounded-[20px] border">
        <Table className="table-fixed">
          <TableHeader className="bg-background border-b-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'bg-background h-13 px-5 py-2 text-center',
                      headerStyle[header.id]
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="[&_tr:last-child>td]:border-b-0">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const href = `${currentPath}/${row.original.id}` as Route

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="border-line cursor-pointer border-b hover:bg-transparent"
                    onClick={linked ? () => router.push(href) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-5 align-middle">
                        {linked ? (
                          <Link
                            href={href}
                            className={cn(
                              'flex min-w-0 items-center overflow-hidden',
                              (cell.column.id === 'createTime' ||
                                cell.column.id === 'createdBy') &&
                                'text-body3_r_16 text-color-coolneutral-30',
                              cell.column.id === 'createdBy' && 'justify-center'
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </Link>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
