'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { dateFormatter } from '@/libs/utils'
import Link from 'next/link'
import type { BlueprintAssignmentCopy } from '../_libs/types'

function SectionTime({ value }: { value: string | null }) {
  if (value === null) {
    return <>-</>
  }
  if (!Number.isFinite(new Date(value).getTime())) {
    return <>Unavailable</>
  }
  return (
    <time dateTime={value}>{dateFormatter(value, 'MMM DD, YYYY HH:mm')}</time>
  )
}

export function BlueprintAssignmentSections({
  copies,
  isExercise
}: {
  copies: readonly BlueprintAssignmentCopy[] | null
  isExercise: boolean
}) {
  if (copies === null) {
    return <p role="status">Section information is unavailable.</p>
  }
  if (copies.length === 0) {
    return <p>No section copies.</p>
  }

  return (
    <Table
      aria-label="Section copies"
      className="rounded-xl border border-gray-200"
    >
      <TableCaption>Section schedules (Asia/Seoul)</TableCaption>
      <TableHeader>
        <TableRow className="bg-gray-50">
          {['Section', 'Start', 'Due', 'End'].map((label) => (
            <TableHead key={label} scope="col" className="text-body2_m_14 p-4">
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {copies.map((copy, index) => {
          const hasDestination =
            Number.isSafeInteger(copy.groupId) &&
            Number(copy.groupId) > 0 &&
            Number.isSafeInteger(copy.id) &&
            Number(copy.id) > 0
          return (
            <TableRow key={`${copy.groupId}-${copy.id}-${index}`}>
              <TableCell className="text-body2_m_14 text-center">
                {hasDestination ? (
                  <Link
                    href={`/admin/course/${copy.groupId}/${isExercise ? 'exercise' : 'assignment'}/${copy.id}`}
                    className="text-primary rounded-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2"
                  >
                    {copy.sectionLabel}
                  </Link>
                ) : (
                  <span>{copy.sectionLabel} (detail unavailable)</span>
                )}
              </TableCell>
              {[copy.startTime, copy.dueTime, copy.endTime].map(
                (value, cell) => (
                  <TableCell
                    key={cell}
                    className="text-body2_m_14 whitespace-nowrap text-center"
                  >
                    <SectionTime value={value} />
                  </TableCell>
                )
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
