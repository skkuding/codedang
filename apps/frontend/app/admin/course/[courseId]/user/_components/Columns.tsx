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
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
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
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
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
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
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
      <p className="whitespace-nowrapfont-medium max-w-[700px] overflow-hidden text-ellipsis">
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
      <p className="whitespace-nowrapfont-medium max-w-[700px] overflow-hidden text-ellipsis">
        {row.getValue('email')}
      </p>
    )
  }
]

function RoleSelect({
  groupId,
  userId,
  role
}: {
  groupId: number
  userId: number
  role: string
}) {
  const [updateGroupMember] = useMutation(UPDATE_GROUP_MEMBER)
  return (
    <Select
      onValueChange={async (value) => {
        await updateGroupMember({
          variables: { groupId, userId, toGroupLeader: value === 'Instructor' }
        })
      }}
      defaultValue={role}
    >
      <SelectTrigger className="w-28">
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
