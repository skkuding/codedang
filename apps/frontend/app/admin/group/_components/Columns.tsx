import type { ColumnDef } from '@tanstack/react-table'

interface DataTableGroup {
  id: number
  groupName: string
  description: string
}

export const columns: ColumnDef<DataTableGroup>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => <div>{row.getValue('id')}</div>
  },
  {
    accessorKey: 'groupName',
    header: 'Name',
    cell: ({ row }) => <div>{row.getValue('groupName')}</div>
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <div>{row.getValue('description')}</div>
  },
  {
    header: 'Semester',
    cell: () => <div>2025 Spring</div>
  }
]
