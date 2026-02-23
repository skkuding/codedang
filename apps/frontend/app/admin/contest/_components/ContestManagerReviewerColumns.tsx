import { managerReviewerTypes } from '@/libs/constants'
import type { ColumnDef } from '@tanstack/react-table'
import { FaTrash } from 'react-icons/fa6'
import { OptionSelect } from '../../_components/OptionSelect'
import { DataTableColumnHeader } from '../../_components/table/DataTableColumnHeader'
import type { ContestManagerReviewer } from '../_libs/schemas'

export const createColumns = (
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setManagers: React.Dispatch<React.SetStateAction<ContestManagerReviewer[]>>, // Role Column에서 이용예정
  setDeleteRowId: React.Dispatch<React.SetStateAction<number | null>>,
  t: (key: string) => string
): ColumnDef<ContestManagerReviewer>[] => {
  return [
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('user_id')} />
      ),
      cell: ({ row }) => {
        return row.getValue('username')
      },
      enableSorting: false
    },
    {
      accessorKey: 'realName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('name')} />
      ),
      cell: ({ row }) => {
        return row.getValue('realName')
      },
      enableSorting: false
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('role')} />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <OptionSelect
            value={row.getValue('type')}
            options={managerReviewerTypes}
            onChange={(selectedType) => {
              setManagers((prev) =>
                prev.map((manager) =>
                  manager.id === row.original.id
                    ? { ...manager, type: selectedType }
                    : manager
                )
              )
            }}
            className="w-[120px] pl-4 text-sm font-normal disabled:pointer-events-none"
          />
        </div>
      ),
      enableSorting: false
    },
    {
      id: 'actions',
      header: () => {},
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                setShowDeleteDialog(true)
                setDeleteRowId(row.original.id)
              }}
              className="p-3 text-red-500 hover:text-red-700"
            >
              <FaTrash className="h-5 w-5 text-[#B0B0B0]" />
            </button>
          </div>
        )
      },
      enableSorting: false
    }
  ]
}
