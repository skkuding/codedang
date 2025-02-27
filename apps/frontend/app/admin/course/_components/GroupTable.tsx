'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import {
  DELETE_COURSE,
  DUPLICATE_COURSE,
  UPDATE_COURSE
} from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { useEffect, useState } from 'react'
import { DataTableSemesterFilter } from '../../_components/table/DataTableSemesterFilter'
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
  const [duplicateCourse] = useMutation(DUPLICATE_COURSE)
  const [semesters, setSemesters] = useState<string[]>([])

  const { data } = useSuspenseQuery(GET_COURSES_USER_LEAD)
  const courses = data.getCoursesUserLead.map((course) => ({
    id: Number(course.id),
    title: course.groupName,
    professor: course.courseInfo?.professor,
    code: course.courseInfo?.courseNum ?? '',
    classNum: Number(course.courseInfo?.classNum ?? 0),
    semester: course.courseInfo?.semester ?? '',
    studentCount: course.memberNum,
    visible: true
  }))

  useEffect(() => {
    const uniqueSemesters = Array.from(
      new Set(courses.map((course) => course.semester).filter(Boolean))
    )
    setSemesters(uniqueSemesters)
  }, [courses])

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
    return duplicateCourse({
      variables: {
        groupId: id
      }
    })
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
          <div className="flex gap-2">
            <DataTableSearchBar columndId="title" className="rounded-full" />
            <DataTableSemesterFilter semesters={semesters} />
          </div>
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
        <DataTable
          headerStyle={headerStyle}
          getHref={(data) => `/admin/course/${data.id}`}
        />
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
