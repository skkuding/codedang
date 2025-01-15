'use client'

import { convertToLetter, dateFormatter } from '@/libs/utils'
import type { ContestProblem } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Suspense } from 'react'
import { MySubmissionFallback, MySubmission } from './MySubmission'

export const columns: ColumnDef<ContestProblem>[] = [
  {
    header: '#',
    accessorKey: 'order',
    cell: ({ row }) => (
      <div className="h-full font-medium">
        {convertToLetter(row.original.order)}
      </div>
    )
  },
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-left font-medium md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'My Submission',
    accessorKey: 'submit',
    cell: ({ row }) =>
      row.original.submissionTime && (
        <div className="flex items-center justify-center">
          <ErrorBoundary fallback={null}>
            <Suspense fallback={<MySubmissionFallback />}>
              <MySubmission problem={row.original} />
            </Suspense>
          </ErrorBoundary>
        </div>
      )
  },
  {
    header: () => 'Submission Time',
    accessorKey: 'submissionTime',
    cell: ({ row }) =>
      row.original.submissionTime &&
      dateFormatter(row.original.submissionTime, 'YYYY-MM-DD HH:mm:ss')
  },
  {
    header: () => 'Score',
    accessorKey: 'score',
    cell: ({ row }) =>
      row.original.maxScore !== null
        ? `${row.original.score ?? '-'} / ${row.original.maxScore}`
        : null
  }
]
