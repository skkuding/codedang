'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Button } from '@/components/shadcn/button'
import { DELETE_COURSE, UPDATE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import type { Route } from 'next'
import { useState } from 'react'
import { GoPencil } from 'react-icons/go'
import { IoDuplicateOutline } from 'react-icons/io5'
import { PiTrashLight } from 'react-icons/pi'
import { columns } from './Columns'
import { DeleteCourseButton } from './DeleteCourseButton'
import { DuplicateCourseButton } from './DuplicateCourseButton'
import { UpdateCourseButton } from './UpdateCourseButton'

const headerStyle = {
  select: '',
  groupName: 'w-2/5',
  courseNum: 'px-0 w-1/5',
  semester: 'px-0 w-1/5',
  members: 'px-0 w-1/6'
}

export function GroupTable() {
  const client = useApolloClient()
  const [deleteCourse] = useMutation(DELETE_COURSE)
  const [updateCourse] = useMutation(UPDATE_COURSE)
  // const [deleteProblem] = useMutation(DELETE_PROBLEM)

  const { data } = useSuspenseQuery(GET_COURSES_USER_LEAD)
  const courses = data.getCoursesUserLead.map((course) => ({
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
    return deleteCourse({
      variables: {
        groupId: id
      }
    })
  }

  const updateTarget = (id: number, courseInput: CourseInput) => {
    return updateCourse({
      variables: {
        groupId: id,
        input: courseInput
      }
    })
  }

  const duplicateTarget = (id: number) => {
    return Promise.resolve() // 빈 Promise 반환
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_COURSES_USER_LEAD]
    })
  }

  return (
    <div>
      <DataTableRoot data={courses} columns={columns}>
        <div className="flex justify-between">
          <DataTableSearchBar columndId="courseName" />
          <div className="flex gap-2">
            <UpdateCourseButton
              updateTarget={updateTarget}
              onSuccess={onSuccess}
            />
            <DuplicateCourseButton
              duplicateTarget={duplicateTarget}
              onSuccess={onSuccess}
            />
            <DeleteCourseButton
              target="course"
              deleteTarget={deleteTarget}
              onSuccess={onSuccess}
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
