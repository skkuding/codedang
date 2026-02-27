import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { AlertModal } from '@/components/AlertModal'
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
import { useTranslate } from '@tolgee/react'
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
  groupId: number,
  t: (key: string) => string
): ColumnDef<DataTableMember>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(Boolean(value))
          }
          aria-label={t('select_all_aria_label')}
          className="translate-y-[2px]"
        />
      ),
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
      accessorKey: 'studentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('student_id_title')} />
      ),
      cell: ({ row }) => {
        return row.getValue('studentId')
      }
    },
    {
      accessorKey: 'major',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('major_title')} />
      ),
      cell: ({ row }) => {
        return row.getValue('major')
      }
    },
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('user_id_title')} />
      ),
      cell: ({ row }) => {
        return row.getValue('username')
      }
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('name_title')} />
      ),
      cell: ({ row }) => {
        return row.getValue('name')
      }
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('role_title')} />
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
        <DataTableColumnHeader column={column} title={t('email_title')} />
      ),
      cell: ({ row }) => {
        return row.getValue('email')
      }
    }
  ]
}

interface RoleSelectProps {
  groupId: number
  userId: number
  role: string
}

function RoleSelect({ groupId, userId, role }: RoleSelectProps) {
  const { t } = useTranslate()
  const [selectedRole, setSelectedRole] = useState(role)
  const [updateGroupMember] = useMutation(UPDATE_GROUP_MEMBER)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState('')

  const handleRoleChange = (value: string) => {
    setPendingRole(value)
    setIsConfirmModalOpen(true)
  }

  const handleConfirm = async () => {
    try {
      await updateGroupMember({
        variables: {
          groupId,
          userId,
          toGroupLeader: pendingRole === 'Instructor'
        }
      })
      setSelectedRole(pendingRole)
      toast.success(t('toast_success_role_changed'))
    } catch (error) {
      const errorMessage =
        error instanceof Error &&
        error.message.includes('You cannot change your own role')
          ? t('error_cannot_change_own_role')
          : t('error_failed_to_change_role')

      toast.error(errorMessage)
      console.error(error)
    } finally {
      setIsConfirmModalOpen(false)
    }
  }
  return (
    <>
      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-min border-0 bg-transparent font-semibold focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder={role} />
        </SelectTrigger>
        <SelectContent className="bg-white font-semibold">
          <SelectGroup>
            <SelectItem value="Instructor">{t('role_instructor')}</SelectItem>
            <SelectItem value="Student">{t('role_student')}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <AlertModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        type="warning"
        title={t('modal_confirm_role_change_title')}
        description={t('modal_confirm_role_change_description', {
          role: pendingRole
        })}
        primaryButton={{
          text: t('modal_confirm_button'),
          onClick: handleConfirm
        }}
      />
    </>
  )
}
