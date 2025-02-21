'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Button } from '@/components/shadcn/button'
import { GET_COURSES } from '@/graphql/course/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import { useState } from 'react'
import { GoPencil } from 'react-icons/go'
import { IoDuplicateOutline } from 'react-icons/io5'
import { PiTrashLight } from 'react-icons/pi'
import { columns } from './Columns'
import { DeleteCourseButton } from './DeleteCourseButton'
import { DuplicateCourseButton } from './DuplicateCourseButton'
import { EditCourseButton } from './EditCourseButton'

const headerStyle = {
  select: '',
  groupName: 'w-2/5',
  courseNum: 'px-0 w-1/5',
  semester: 'px-0 w-1/5',
  members: 'px-0 w-1/6'
}

export function GroupTable() {
  const client = useApolloClient()
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState<boolean>(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false)
  // const [deleteProblem] = useMutation(DELETE_PROBLEM)

  const { data } = useSuspenseQuery(GET_COURSES, {
    variables: {
      cursor: 1,
      take: 5
    }
  })
  const courses = data.getCourses.map((course) => ({
    id: Number(course.id),
    title: course.groupName,
    code: course.courseInfo?.courseNum ?? '',
    classNum: Number(course.courseInfo?.classNum ?? 0),
    semester: course.courseInfo?.semester ?? '',
    studentCount: 0,
    visible: true
    // description: course.description
  }))

  const deleteTarget = (id: number) => {
    return Promise.resolve() // 빈 Promise 반환
  }

  const editTarget = (id: number) => {
    return Promise.resolve() // 빈 Promise 반환
  }

  const duplicateTarget = (id: number) => {
    return Promise.resolve() // 빈 Promise 반환
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_COURSES]
    })
  }

  return (
    <div>
      <DataTableRoot data={courses} columns={columns}>
        <div className="flex justify-between">
          <DataTableSearchBar columndId="courseName" />
          <div className="flex gap-2">
            <EditCourseButton editTarget={editTarget} onSuccess={onSuccess} />
            <DuplicateCourseButton
              duplicateTarget={duplicateTarget}
              onSuccess={onSuccess}
            />
            <DeleteCourseButton
              target="course"
              deleteTarget={deleteTarget}
              onSuccess={onSuccess}
              className="ml-auto"
            />
          </div>
        </div>
        <DataTable headerStyle={headerStyle} />
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}

// function ContestsDeleteButton() {
//   const client = useApolloClient()
//   const [deleteGroup] = useMutation(DELETE_GROUP)

//   const deleteTarget = (id: number) => {
//     return deleteGroup({
//       variables: {
//         groupId: id
//       }
//     })
//   }

//   const onSuccess = () => {
//     client.refetchQueries({
//       include: [GET_GROUPS]
//     })
//   }

//   return (
//     <DataTableDeleteButton
//       target="group"
//       deleteTarget={deleteTarget}
//       onSuccess={onSuccess}
//     />
//   )
// }

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
