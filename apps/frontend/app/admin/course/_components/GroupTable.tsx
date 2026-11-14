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
import { columns, type DataTableCourse } from './Columns'
import { CreateSection } from './CreateSection'
import { DeleteCourseButton } from './DeleteCourseButton'
import { DuplicateCourseButton } from './DuplicateCourseButton'
import { UpdateCourseButton } from './UpdateCourseButton'
<<<<<<< HEAD
import { bluePrintMockData } from './section_mock'
=======
import { coursesMockData } from './section_mock'
>>>>>>> 57a59693a (fix: rebase commit)

export function GroupTable() {
  const client = useApolloClient()

  const [semesters, setSemesters] = useState<string[]>([])

  // const {data: bluePrintData} = useSuspenseQuery(GET_BLUE_PRINT_COURSES)
  const { data: normalCourseData } = useSuspenseQuery(GET_COURSES_USER_LEAD)

  const bluePrintCourses: DataTableCourse[] = useMemo(
    () =>
      bluePrintMockData.map((blueprint) => ({
        id: blueprint.id,
        type: 'master',
        title: blueprint.courseTitle,
        code: String(blueprint.courseNum),
        classNum: null,
        semester: blueprint.semester,
        studentCount: null,
        sections: blueprint.sections.map((section) => ({
          id: section.id,
          type: 'section',
          title: section.groupName,
          code: String(blueprint.courseNum),
          classNum: section.courseInfo.classNum,
          semester: blueprint.semester,
          studentCount: section.memberNum
        }))
      })),
    []
  )

  const normalCourses: DataTableCourse[] = useMemo(
    () =>
      normalCourseData.getCoursesUserLead.map((course) => ({
        id: Number(course.id),
        type: 'course' as const,
        title: course.groupName,
        code: course.courseInfo?.courseNum ?? '',
        classNum: course.courseInfo?.classNum ?? null,
        semester: course.courseInfo?.semester ?? '',
        studentCount: course.memberNum
      })),
    [normalCourseData]
  )

  const courses = useMemo(
    () => [...bluePrintCourses, ...normalCourses],
    [bluePrintCourses, normalCourses]
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

  const renderCreateSection = (row: DataTableCourse) => (
    <CreateSection courseCode={row.code} />
  )

  return (
    <div>
      <DataTableRoot
        data={courses}
        columns={columns}
        getSubRows={(row) => row.sections}
      >
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
          renderCreateSection={renderCreateSection}
        />
        <DataTablePagination showSelection />
      </DataTableRoot>
    </div>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
