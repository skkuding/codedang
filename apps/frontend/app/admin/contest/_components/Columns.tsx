'use client'

import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { dateFormatter } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { FiEyeOff } from 'react-icons/fi'
import { FiEye } from 'react-icons/fi'

interface Contest {
  id: number
  title: string
  startTime: string
  endTime: string
  participants: number
  config: {
    isVisible: boolean
  }
}

// const EDIT_VISIBLE = gql(`
//   mutation UpdateContestVisible($groupId: Int!, $input: UpdateContestInput!) {
//     updateContest(groupId: $groupId, input: $input) {
//       id
//       config
//     }
//   }
// `)

function VisibleCell({ isVisible }: { isVisible: boolean; id: number }) {
  // const [updateVisible] = useMutation(EDIT_VISIBLE)

  return (
    <div className="flex space-x-2">
      <Switch
        id="hidden-mode"
        checked={isVisible}
        onCheckedChange={() => {
          // updateVisible({
          //   variables: {
          //     groupId: 1,
          //     input: {
          //       id,
          //       config: {
          //         isVisible: !isVisible
          //       }
          //     }
          //   }
          // })
        }}
      />
      <div className="flex items-center justify-center">
        {isVisible ? (
          <FiEye className="text-primary h-[14px] w-[14px]" />
        ) : (
          <FiEyeOff className="h-[14px] w-[14px] text-gray-400" />
        )}
      </div>
    </div>
  )
}

export const columns: ColumnDef<Contest>[] = [
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
    accessorKey: 'startTime',
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
    accessorKey: 'participants',
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
    accessorKey: 'config.isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visible" />
    ),
    cell: ({ row }) => {
      const isVisible: boolean = row.original.config.isVisible
      return <VisibleCell isVisible={isVisible} id={+row.original.id} />
    }
  }
]
