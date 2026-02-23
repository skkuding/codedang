'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import { Switch } from '@/components/shadcn/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { UPDATE_ASSIGNMENT_VISIBLE } from '@/graphql/assignment/mutations'
import { cn, dateFormatter, formatDateRange } from '@/libs/utils'
import invisibleIcon from '@/public/icons/invisible.svg'
import visibleIcon from '@/public/icons/visible.svg'
import { useMutation } from '@apollo/client'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

export interface DataTableAssignment {
  id: number
  title: string
  startTime: string
  dueTime?: string
  endTime: string
  description: string
  participants: number
  isVisible: boolean
  isRankVisible: boolean
  week: number
}

function VisibleCell({ row }: { row: Row<DataTableAssignment> }) {
  const { t } = useTranslate()
  const [updateVisible] = useMutation(UPDATE_ASSIGNMENT_VISIBLE)
  const params = useParams()
  const groupId = Number(params.courseId)

  return (
    <div className="ml-4 flex items-center space-x-2">
      <Switch
        onClick={(e) => e.stopPropagation()}
        id="hidden-mode"
        checked={row.original.isVisible}
        onCheckedChange={() => {
          row.original.isVisible = !row.original.isVisible
          const currentTime = dateFormatter(new Date(), 'YYYY-MM-DD HH:mm:ss')
          const startTime = dateFormatter(
            row.original.startTime,
            'YYYY-MM-DD HH:mm:ss'
          )
          const endTime = dateFormatter(
            row.original.endTime,
            'YYYY-MM-DD HH:mm:ss'
          )
          if (currentTime > startTime && currentTime < endTime) {
            toast.error(t('cannot_change_visibility_of_ongoing_assignment'))
            return
          }
          // TODO: assignment update API 수정되면 고치기
          updateVisible({
            variables: {
              groupId,
              input: {
                id: row.original.id,
                title: row.original.title,
                startTime: row.original.startTime,
                endTime: row.original.endTime,
                description: row.original.description,
                isVisible: row.original.isVisible,
                isRankVisible: row.original.isRankVisible,
                week: row.original.week
              }
            }
          })
        }}
      />
      <div className="flex items-center justify-center">
        {
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 w-6"
                >
                  {row.original.isVisible ? (
                    <Image src={visibleIcon} alt={t('visible_alt_text')} />
                  ) : (
                    <Image src={invisibleIcon} alt={t('invisible_alt_text')} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  row.original.isVisible ? 'bg-primary' : 'bg-black'
                )}
                align="end"
                alignOffset={-20}
              >
                {row.original.isVisible ? (
                  <p>{t('this_assignment_is_visible')}</p>
                ) : (
                  <p>{t('this_assignment_is_not_visible_to_users')}</p>
                )}
                <TooltipPrimitive.Arrow
                  className={cn(
                    'fill-current',
                    row.original.isVisible ? 'text-primary' : 'text-black'
                  )}
                />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      </div>
    </div>
  )
}

export const getColumns = (
  t: (key: string) => string
): ColumnDef<DataTableAssignment>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label={t('select_all')}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={t('select_row')}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('title')}
        className="w-[400px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('title')
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('period')} />
    ),
    cell: ({ row }) => {
      return formatDateRange(row.original.startTime, row.original.endTime)
    }
  },
  {
    accessorKey: 'week',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('week')} />
    ),
    cell: ({ row }) => {
      return `Week ${row.original.week}`
    }
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('visible')} />
    ),
    cell: ({ row }) => {
      return <VisibleCell row={row} />
    }
  }
]
