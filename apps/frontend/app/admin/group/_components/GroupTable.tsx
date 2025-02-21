'use client'

import {
  DataTable,
  DataTableDeleteButton,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import { columns } from './Columns'

const headerStyle = {
  select: '',
  groupName: 'w-2/5',
  courseNum: 'px-0 w-1/5',
  semester: 'px-0 w-1/5',
  members: 'px-0 w-1/6'
}

export function GroupTable() {
  // const { data } = useSuspenseQuery(GET_GROUPS, {
  //   variables: {
  //     cursor: 1,
  //     take: 5
  //   }
  // })
  // const groups = data.getGroups.map((group) => ({
  //   id: Number(group.id),
  //   groupName: group.groupName,
  //   description: group.description
  // }))

  return (
    <>dd</>
    // <DataTableRoot data={groups} columns={columns}>
    //   <div className="flex gap-2">
    //     <DataTableSearchBar columndId="groupName" />
    //     {/* TODO: 백엔드 구현 이후 Duplicate 버튼 추가 예정 */}
    //     <ContestsDeleteButton />
    //   </div>
    //   <DataTable
    //     headerStyle={headerStyle}
    //     getHref={(data) => `/admin/group/${data.id}` as const}
    //   />
    //   <DataTablePagination />
    // </DataTableRoot>
  )
}

function ContestsDeleteButton() {
  const client = useApolloClient()
  // const [deleteGroup] = useMutation(DELETE_GROUP)

  // const deleteTarget = (id: number) => {
  //   return deleteGroup({
  //     variables: {
  //       groupId: id
  //     }
  //   })
  // }

  // const onSuccess = () => {
  //   client.refetchQueries({
  //     include: [GET_GROUPS]
  //   })
  // }

  // return (
  //   <DataTableDeleteButton
  //     target="group"
  //     deleteTarget={deleteTarget}
  //     onSuccess={onSuccess}
  //   />
  // )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
