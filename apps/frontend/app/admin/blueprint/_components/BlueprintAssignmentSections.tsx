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
import { cn, dateFormatter } from '@/libs/utils'
import Link from 'next/link'
import type { BlueprintAssignmentCopy } from '../_libs/types'

function SectionTime({
  value,
  compact
}: {
  value: string | null
  compact: boolean
}) {
  if (value === null) {
    return <>-</>
  }
  if (!Number.isFinite(new Date(value).getTime())) {
    return <>Unavailable</>
  }
  return (
    <time dateTime={value}>
      {dateFormatter(
        value,
        compact ? 'YYYY-MM-DD HH:mm' : 'MMM DD, YYYY HH:mm'
      )}
    </time>
  )
}

export function BlueprintAssignmentSections({
  copies,
  isExercise,
  compact = false
}: {
  copies: readonly BlueprintAssignmentCopy[] | null
  isExercise: boolean
  compact?: boolean
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
      className={cn(
        compact
          ? 'border-line min-w-[680px] border [border-radius:8px]'
          : 'rounded-xl border border-gray-200'
      )}
    >
      <TableCaption
        className={
          compact ? 'text-body2_m_14 mt-2 px-2.5 text-left' : undefined
        }
      >
        Section schedules (Asia/Seoul)
      </TableCaption>
      <TableHeader className={compact ? 'border-line border-b' : undefined}>
        <TableRow className={compact ? 'bg-color-neutral-99' : 'bg-gray-50'}>
          {['Section', 'Start', 'Due', 'End'].map((label) => (
            <TableHead
              key={label}
              scope="col"
              className={cn(
                'text-body2_m_14',
                compact
                  ? 'text-color-cool-neutral-15 h-[37px] px-2.5 py-2 text-left tracking-[-0.42px]'
                  : 'p-4'
              )}
            >
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
              <TableCell
                className={cn(
                  compact
                    ? 'text-sub4_sb_14 border-line text-color-cool-neutral-30 h-9 border-b px-2.5 py-[7px] text-left md:py-[7px]'
                    : 'text-body2_m_14 text-center'
                )}
              >
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
                    className={cn(
                      'text-body2_m_14 whitespace-nowrap',
                      compact
                        ? 'border-line text-color-cool-neutral-30 h-9 border-b px-2.5 py-[7px] text-left tracking-[-0.42px] md:py-[7px]'
                        : 'text-center'
                    )}
                  >
                    <SectionTime value={value} compact={compact} />
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
