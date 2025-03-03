import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { UPDATE_GROUP_MEMBER } from '@/graphql/user/mutation'
import { useMutation } from '@apollo/client'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

export interface DataTableMember {
  id: number
  name: string
  email: string
  major: string
  studentId: string
  role: string
  username: string
}

export const createColumns = (
  groupId: number
): ColumnDef<DataTableMember>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label="Select all"
        className="translate-y-[2px] bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="translate-y-[2px] bg-white"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'studentId',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Student ID" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
        {row.getValue('studentId')}
      </p>
    )
  },
  {
    accessorKey: 'major',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Major" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
        {row.getValue('major')}
      </p>
    )
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="User ID" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
        {row.getValue('username')}
      </p>
    )
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
        {row.getValue('name')}
      </p>
    )
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Role" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <RoleSelect
          groupId={groupId}
          userId={row.original.id}
          role={row.original.role}
        />
      </div>
    )
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Email" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
        {row.getValue('email')}
      </p>
    )
  }
]

interface RoleSelectProps {
  groupId: number
  userId: number
  role: string
}

function RoleSelect({ groupId, userId, role }: RoleSelectProps) {
  const [selectedRole, setSelectedRole] = useState(role)
  const [updateGroupMember] = useMutation(UPDATE_GROUP_MEMBER)
  return (
    <Select
      value={selectedRole}
      onValueChange={async (value) => {
        try {
          await updateGroupMember({
            variables: {
              groupId,
              userId,
              toGroupLeader: value === 'Instructor'
            }
          })
          setSelectedRole(value)
        } catch (error) {
          console.error(error)
        }
      }}
    >
      <SelectTrigger className="w-min border-0 font-semibold focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder={role} />
      </SelectTrigger>
      <SelectContent className="bg-white font-semibold">
        <SelectGroup>
          <SelectItem value="Instructor">Instructor</SelectItem>
          <SelectItem value="Student">Student</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
