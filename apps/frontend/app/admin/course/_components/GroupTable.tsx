'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useApolloClient, useSuspenseQuery } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { DataTableSemesterFilter } from '../../_components/table/DataTableSemesterFilter'
import { columns } from './Columns'
import { DeleteCourseButton } from './DeleteCourseButton'
import { DuplicateCourseButton } from './DuplicateCourseButton'
import { UpdateCourseButton } from './UpdateCourseButton'

export function GroupTable() {
  const client = useApolloClient()

  const [semesters, setSemesters] = useState<string[]>([])

  const { data } = useSuspenseQuery(GET_COURSES_USER_LEAD)
  const courses = useMemo(
    () =>
      data.getCoursesUserLead.map((course) => ({
        id: Number(course.id),
        title: course.groupName,
        code: course.courseInfo?.courseNum ?? '',
        semester: course.courseInfo?.semester ?? '',
        studentCount: course.memberNum
      })),
    [data.getCoursesUserLead]
  )

  useEffect(() => {
    const uniqueSemesters = Array.from(
      new Set(courses.map((course) => course.semester).filter(Boolean))
    )
    setSemesters(uniqueSemesters)
  }, [courses])

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_COURSES_USER_LEAD]
    })
  }

  const bodyStyle = {
    title: 'justify-start'
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
            <UpdateCourseButton onSuccess={onSuccess} />
            <DuplicateCourseButton onSuccess={onSuccess} />
            <DeleteCourseButton onSuccess={onSuccess} />
          </div>
        </div>
        <DataTable
          bodyStyle={bodyStyle}
          getHref={(data) => `/admin/course/${data.id}`}
        />
        <DataTablePagination showSelection />
      </DataTableRoot>
    </div>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
