import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import React from 'react'

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => <p>s</p>
  },
  {
    header: 'Registered',
    accessorKey: 'registered',
    cell: ({ row }) => <p>s</p>
  },
  {
    header: 'Participants',
    accessorKey: 'participants',
    cell: ({ row }) => <p>s</p>
  }
]
