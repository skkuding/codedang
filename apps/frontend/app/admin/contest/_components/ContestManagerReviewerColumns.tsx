import { managerReviewerTypes } from '@/libs/constants'
import type { ColumnDef } from '@tanstack/react-table'
import { FaTrash } from 'react-icons/fa6'
import { OptionSelect } from '../../_components/OptionSelect'
import type { ContestManagerReviewer } from '../_libs/schemas'

export const createColumns = (
  showDeleteDialog: boolean,
  setShowDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>,
  setManagers: React.Dispatch<React.SetStateAction<ContestManagerReviewer[]>> // Role Column에서 이용예정
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
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash className="h-5 w-5 text-[#B0B0B0]" />
          </button>
          {showDeleteDialog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="rounded bg-white p-4 shadow-lg">
                <p>Are you sure you want to delete this manager?</p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="mr-2 rounded bg-gray-200 px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setManagers((prev) =>
                        prev.filter((manager) => manager.id !== row.original.id)
                      )
                      setShowDeleteDialog(false)
                    }}
                    className="rounded bg-red-500 px-4 py-2 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    enableSorting: false
  }
]
