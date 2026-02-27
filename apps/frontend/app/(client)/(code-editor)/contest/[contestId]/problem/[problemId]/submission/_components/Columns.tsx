'use client'

import { dateFormatter, getResultColor, omitString } from '@/libs/utils'
import type { SubmissionItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<SubmissionItem>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => <p className="text-body4_r_14">{row.original.id}</p>
  },
  {
    header: () => 'Problem',
    accessorKey: 'problem',
    cell: ({ row }) =>
      omitString({ targetString: row.original.problem.title, maxlength: 13 })
  },
  {
    header: () => 'Result',
    accessorKey: 'result',
    cell: ({ row }) => {
      return (
        <p className={getResultColor(row.original.result)}>
          {row.original.result}
        </p>
      )
    }
  },
  {
    header: () => 'Language',
    accessorKey: 'language',
    cell: ({ row }) => {
      return (
        <p>{row.original.language !== 'Cpp' ? row.original.language : 'C++'}</p>
      )
    }
  },
  {
    header: () => 'Submission Time',
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm:ss')
  },
  {
    header: () => 'Code Size',
    accessorKey: 'codeSize',
    cell: ({ row }) => {
      return row.original.codeSize === null ? (
        <p>N/A</p>
      ) : (
        <p>{row.original.codeSize} B</p>
      )
    }
  }
]
