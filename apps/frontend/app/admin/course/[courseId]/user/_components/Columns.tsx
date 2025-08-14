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
import { toast } from 'sonner'

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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="translate-y-[2px]"
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
    cell: ({ row }) => {
      return row.getValue('studentId')
    }
  },
  {
    accessorKey: 'major',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Major" />
    ),
    cell: ({ row }) => {
      return row.getValue('major')
    }
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ row }) => {
      return row.getValue('username')
    }
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return row.getValue('name')
    }
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
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
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return row.getValue('email')
    }
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
          toast.success('Successfully changed role')
        } catch (error) {
          toast.error('Failed to change role')
          console.error(error)
        }
      }}
    >
      <SelectTrigger className="w-min border-0 focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder={role} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectGroup>
          <SelectItem value="Instructor">Instructor</SelectItem>
          <SelectItem value="Student">Student</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
