'use client'

import { gql } from '@generated'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn, dateFormatter } from '@/lib/utils'
import { useMutation } from '@apollo/client'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'sonner'

interface DataTableContest {
  id: number
  title: string
  startTime: string
  endTime: string
  description: string
  participants: number
  config: {
    isVisible: boolean
    isRankVisible: boolean
  }
}

const EDIT_VISIBLE = gql(`
  mutation UpdateContestVisible($groupId: Int!, $input: UpdateContestInput!) {
    updateContest(groupId: $groupId, input: $input) {
      id
      config
    }
  }
`)

function VisibleCell({ row }: { row: Row<DataTableContest> }) {
  const [updateVisible] = useMutation(EDIT_VISIBLE)

  return (
    <div className="flex space-x-2">
      <Switch
        id="hidden-mode"
        checked={row.original.config.isVisible}
        onCheckedChange={() => {
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
            toast.error('Cannot change visibility of ongoing contest')
            return
          }
          row.original.config = {
            ...row.original.config,
            isVisible: !row.original.config.isVisible
          }
          // TODO: contest update API 수정되면 고치기
          updateVisible({
            variables: {
              groupId: 1,
              input: {
                id: row.original.id,
                title: row.original.title,
                startTime: row.original.startTime,
                endTime: row.original.endTime,
                description: row.original.description,
                config: {
                  isVisible: row.original.config.isVisible,
                  isRankVisible: row.original.config.isRankVisible
                }
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
                <button>
                  {row.original.config.isVisible ? (
                    <FiEye className="text-primary h-[14px] w-[14px]" />
                  ) : (
                    <FiEyeOff className="h-[14px] w-[14px] text-gray-400" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  row.original.config.isVisible ? 'bg-primary' : 'bg-black'
                )}
                align="end"
                alignOffset={-20}
              >
                {row.original.config.isVisible ? (
                  <p>This contest is visible</p>
                ) : (
                  <p>This contest is not visible to users</p>
                )}
                <TooltipPrimitive.Arrow
                  className={cn(
                    'fill-current',
                    row.original.config.isVisible
                      ? 'text-primary'
                      : 'text-black'
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

export const columns: ColumnDef<DataTableContest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] bg-white"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => row.getValue('title'),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'period',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader
          column={column}
          title="Period"
          className="text-center"
        />
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-center">
        {`${dateFormatter(row.original.startTime, 'YYYY-MM-DD')} ~ ${dateFormatter(row.original.endTime, 'YYYY-MM-DD')}`}
      </p>
    )
  },
  {
    accessorKey: 'register',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Register" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-center">{row.original.participants}</p>
    )
  },
  {
    accessorKey: 'hidden',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visible" />
    ),
    cell: ({ row }) => {
      return <VisibleCell row={row} />
    }
  }
]
