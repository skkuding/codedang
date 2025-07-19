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

  const deleteTarget = (userId: number, groupId: number) => {
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
      deleteTarget={(userId: number, extra?: number) =>
        deleteTarget(userId, extra ?? groupId)
      }
      onSuccess={onSuccess}
      className="ml-auto"
      extraArg={groupId}
    >
      <ul className="list-disc space-y-2 pl-5">
        {table.getSelectedRowModel().rows.map((row) => (
          <li key={row.id}>
            {row.getValue('name')} [{row.getValue('studentId')}]
          </li>
        ))}
      </ul>
    </DataTableDeleteButton>
  )
}
