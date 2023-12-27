'use client'

import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { ColumnDef } from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import dayjs from 'dayjs'

const notices = [
  {
    id: 1,
    title: '아주 중요한 공지사항 (1)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  },
  {
    id: 2,
    title: '더 중요한 공지사항 (2)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  },
  {
    id: 3,
    title: '제일 중요한 공지사항 (3)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  },
  {
    id: 4,
    title: 'HTML element들 테스트해봐요 (4)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'manager'
  },
  {
    id: 5,
    title: '아주 중요한 공지사항 (5)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  },
  {
    id: 6,
    title: '더 중요한 공지사항 (6)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  },
  {
    id: 7,
    title: '제일 중요한 공지사항 (7)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  },
  {
    id: 8,
    title: 'HTML element들 테스트해봐요 (8)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'manager'
  },
  {
    id: 9,
    title: '아주 중요한 공지사항 (9)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  },
  {
    id: 10,
    title: '더 중요한 공지사항 (10)',
    createTime: '2023-12-26T15:33:40.887Z',
    isFixed: false,
    createdBy: 'super'
  }
]

interface Notice {
  id: number
  title: string
  createTime: string
  isFixed: boolean
  createdBy: string
}

const columns: ColumnDef<Notice>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return <div className="text-base">{row.original.title}</div>
    }
  },
  {
    header: () => (
      <div className="flex justify-end">
        <div className="flex w-32 justify-center">Date</div>
      </div>
    ),
    accessorKey: 'createTime',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end text-gray-500">
          <div className="flex w-32 justify-center">
            {dayjs(row.original.createTime).format('YYYY-MM-DD')}
          </div>
        </div>
      )
    }
  }
]

export default function NoticeTable() {
  const table = useReactTable({
    data: notices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })
  return (
    <div className="mt-5">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationPrevious href="#" />
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
          <PaginationLink href="#">2</PaginationLink>
          <PaginationLink href="#">3</PaginationLink>
          <PaginationNext href="#" />
        </PaginationContent>
      </Pagination>
    </div>
  )
}
