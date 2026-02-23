import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { LevelBadge } from '@/components/LevelBadge'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

interface Tag {
  id: number
  name: string
}

export interface SharedDataTableProblem {
  id: number
  title: string
  updateTime: string
  difficulty: string
  languages: string[]
  tag: { id: number; tag: Tag }[]
}

export const getColumns = (
  t: (key: string) => string
): ColumnDef<SharedDataTableProblem>[] => [
  {
    id: 'select',
    header: ({ table }) => {
      ;<Checkbox
        checked={table.getIsAllPageRowsSelected()}
        aria-label={t('select_all_aria_label')}
        className="translate-y-[2px]"
        disabled={true}
      />
    },
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={t('select_row_aria_label')}
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
        title={t('title_header')}
        className="w-[300px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('title')
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
      const result = langValue.some((language) => valueArray.includes(language))
      return result
    }
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('update_header')} />
    ),
    cell: ({ row }) => {
      return <div>{row.original.updateTime.substring(2, 10)}</div>
    }
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('level_header')} />
    ),
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      return <LevelBadge level={level as Level} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  }
]
