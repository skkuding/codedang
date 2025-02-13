'use client'

import type { Leaderboard } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import React from 'react'

export const columns: ColumnDef<Leaderboard>[] = [
  {
    header: 'Rank',
    accessorKey: 'rank',
    cell: () => <p>s</p>
  },
  {
    header: 'User ID',
    accessorKey: 'username',
    cell: () => <p>s</p>
  },
  {
    header: 'A',
    accessorKey: 'a',
    cell: () => <p>s</p>
  },
  {
    header: 'B',
    accessorKey: 'b',
    cell: () => <p>s</p>
  },
  {
    header: 'C',
    accessorKey: 'c',
    cell: () => <p>s</p>
  },
  {
    header: 'D',
    accessorKey: 'd',
    cell: () => <p>s</p>
  },
  {
    header: 'E',
    accessorKey: 'e',
    cell: () => <p>s</p>
  },
  {
    header: 'F',
    accessorKey: 'f',
    cell: () => <p>s</p>
  },
  {
    header: 'G',
    accessorKey: 'g',
    cell: () => <p>s</p>
  },
  {
    header: 'H',
    accessorKey: 'h',
    cell: () => <p>s</p>
  },
  {
    header: 'I',
    accessorKey: 'i',
    cell: () => <p>s</p>
  },
  {
    header: 'J',
    accessorKey: 'j',
    cell: () => <p>s</p>
  },
  {
    header: 'K',
    accessorKey: 'k',
    cell: () => <p>s</p>
  },
  {
    header: 'L',
    accessorKey: 'l',
    cell: () => <p>s</p>
  },
  {
    header: 'Total Penalty',
    accessorKey: 'totalPenalty',
    cell: () => <p>s</p>
  },
  {
    header: 'Solved',
    accessorKey: 'solved',
    cell: () => <p>s</p>
  }
]
