import { gql } from '@generated'
import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { useMutation } from '@apollo/client'
import type { ColumnDef } from '@tanstack/react-table'
import { FiEyeOff } from 'react-icons/fi'
import { FiEye } from 'react-icons/fi'

interface Tag {
  id: number
  name: string
}

interface DataTableProblem {
  id: number
  title: string
  createTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  isVisible: boolean
  languages: string[]
  problemTag: { id: number; tag: Tag }[]
}

const EDIT_VISIBLE = gql(`
  mutation UpdateVisible($groupId: Int!, $input: UpdateProblemInput!) {
    updateProblem(groupId: $groupId, input: $input) {
      id
      isVisible
    }
  }
`)

function VisibleCell({ isVisible, id }: { isVisible: boolean; id: number }) {
  const [updateVisible] = useMutation(EDIT_VISIBLE)

  return (
    <div className="flex space-x-2">
      <Switch
        id="hidden-mode"
        checked={isVisible}
        onCheckedChange={() => {
          updateVisible({
            variables: {
              groupId: 1,
              input: {
                id: id,
                isVisible: !isVisible
              }
            }
          })
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

export const columns: ColumnDef<DataTableProblem>[] = [
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
    cell: ({ row }) => {
      return (
        <div className="flex-col">
          {row.getValue('title')}
          <div className="flex">
            <div>
              {row.original.problemTag?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="mr-1 whitespace-nowrap rounded-md border-gray-400 bg-gray-300 px-1 font-normal"
                >
                  {tag.tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false
  },
  /**
   * @description
   * made this column for filtering languages
   * doesn't show in datatable
   */
  {
    accessorKey: 'languages',
    header: () => {},
    cell: () => {},
    filterFn: (row, id, value) => {
      const languages = row.original.languages
      if (!languages?.length) {
        return false
      }

      const langValue: string[] = row.getValue(id)
      const valueArray = value as string[]
      const result = langValue.every((language) =>
        valueArray.includes(language)
      )
      return result
    }
  },
  /**
   * @description
   * made this column for filtering languages
   * doesn't show in datatable
   */
  {
    accessorKey: 'problemTag',
    header: () => {},
    cell: () => {},
    filterFn: (row, id, value) => {
      const tags = row.original.problemTag
      if (!tags?.length) {
        return false
      }

      const tagValue = row.getValue(id)
      const valueArray = value as number[]
      const tagIdArray = (tagValue as { id: number; tag: Tag }[]).map(
        (tag) => tag.tag.id
      )
      const result = tagIdArray.every((tagId) => valueArray.includes(tagId))
      return result
    }
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creation date" />
    ),
    cell: ({ row }) => {
      const updateTime: string = row.getValue('createTime')
      return <div>{updateTime.substring(2, 10)}</div>
    }
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      const formattedLevel = `Lev.${level.slice(-1)}`
      return <div>{formattedLevel}</div>
    }
  },
  {
    accessorKey: 'submissionCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission" />
    ),
    cell: ({ row }) => row.getValue('submissionCount')
  },
  {
    accessorKey: 'acceptedRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Solved" />
    ),
    cell: ({ row }) => {
      const acceptedRate: number = row.getValue('acceptedRate')
      const acceptedRateFloat = acceptedRate.toFixed(2)
      return <div>{acceptedRateFloat}%</div>
    }
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visible" />
    ),
    cell: ({ row }) => {
      const isVisible: boolean = row.getValue('isVisible')
      return <VisibleCell isVisible={isVisible} id={row.original.id} />
    }
  }
]
