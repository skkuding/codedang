'use client'

import { DataTableDeleteButton } from '@/app/admin/_components/table/DataTableDeleteButton'
import { useDataTable } from '@/app/admin/_components/table/context'
import { DELETE_GROUP_MEMBER } from '@/graphql/user/mutation'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useApolloClient, useMutation } from '@apollo/client'
import { useParams } from 'next/navigation'

export function DeleteUserButton() {
  const client = useApolloClient()
  const [deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER)
  const { table } = useDataTable()
  const params = useParams()
  const groupId = Number(params.courseId)

  interface DeleteTargetParams {
    userId: number
    groupId: number
  }

  const deleteTarget = ({ userId, groupId }: DeleteTargetParams) => {
    return deleteGroupMember({
      variables: {
        groupId,
        userId
      }
    })
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_GROUP_MEMBERS]
    })
  }

  return (
    <DataTableDeleteButton
      target="user"
      deleteTarget={(id: number) => deleteTarget({ userId: id, groupId })}
      onSuccess={onSuccess}
      className="ml-auto"
      extraArg={groupId}
      deleteItems={table
        .getSelectedRowModel()
        .rows.map(
          (row) => `${row.getValue('name')} [${row.getValue('studentId')}]`
        )}
    />
  )
}
