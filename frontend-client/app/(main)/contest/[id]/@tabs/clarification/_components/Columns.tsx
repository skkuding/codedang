'use client'

import type { ContestClarification } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import ExpandableCell from './ExpandableCell'

export const columns: ColumnDef<ContestClarification>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => (
      <div className="h-full" style={{ verticalAlign: 'top' }}>
        {row.original.id}
      </div>
    )
  },
  // {
  //   header: () => 'Description',
  //   accessorKey: 'content',
  //   cell: ({ row }) => <ExpandableCell>{row.original.content}</ExpandableCell>
  // },
  {
    header: () => 'Description',
    accessorKey: 'content',
    cell: () => (
      <ExpandableCell>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eveniet itaque
        reiciendis alias quisquam saepe, cumque magni nam obcaecati possimus
        labore animi natus consequatur voluptatem, eum repudiandae quia in
        ducimus culpa.
      </ExpandableCell>
    )
  },
  {
    header: () => 'Time',
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dayjs(row.original.createTime).format('YYYY-MM-DD HH:mm:ss')
  }
]
