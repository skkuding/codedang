import { managerReviewerTypes } from '@/libs/constants'
import type { ColumnDef } from '@tanstack/react-table'
import { FaTrash } from 'react-icons/fa6'
import { OptionSelect } from '../../_components/OptionSelect'
import type { ContestManagerReviewer } from '../_libs/schemas'

export const createColumns = (
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setManagers: React.Dispatch<React.SetStateAction<ContestManagerReviewer[]>>, // Role Column에서 이용예정
  setDeleteRowId: React.Dispatch<React.SetStateAction<number | null>>
): ColumnDef<ContestManagerReviewer>[] => [
  {
    accessorKey: 'username',
    header: () => <p className="text-center text-sm">User ID</p>,
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {row.getValue('username')}
      </p>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'realName',
    header: () => <p className="text-center text-sm">Name</p>,
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {row.getValue('realName')}
      </p>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'type',
    header: () => <p className="text-center text-sm">Role</p>,
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
