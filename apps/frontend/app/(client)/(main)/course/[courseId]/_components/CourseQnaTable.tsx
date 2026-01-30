import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import {
  DataTable,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import type { CourseQnAItem } from '@/types/type'
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useState } from 'react'
import { courseQnAColumns } from './CourseQnaColumns'

interface CourseQnaTableProps {
  courseId: number
}

export function CourseQnaTable({ courseId }: CourseQnaTableProps) {
  const [filterType, setFilterType] = useState<'General' | 'Problem'>('Problem')

  const tasks = useSuspenseQueries({
    queries: [
      assignmentQueries.muliple({ courseId, isExercise: false }),
      assignmentQueries.muliple({ courseId, isExercise: true })
    ]
  })

  const allTasks = useMemo(() => {
    const assignments = tasks[0].data || []
    const exercises = tasks[1].data || []
    return [...assignments, ...exercises]
  }, [tasks])

  const problemQueries = useSuspenseQueries({
    queries: allTasks.map((task) =>
      assignmentProblemQueries.list({
        assignmentId: task.id,
        groupId: Number(courseId)
      })
    )
  })

  const allProblemsMap = useMemo(() => {
    const flatProblems = problemQueries.flatMap(
      (query) => query.data?.data || []
    )
    return new Map(flatProblems.map((p) => [p.id, p]))
  }, [problemQueries])

  const { data: qnaData } = useSuspenseQuery<CourseQnAItem[]>({
    queryKey: ['courseQnA', courseId, filterType],
    queryFn: () =>
      safeFetcherWithAuth
        .get(`course/${courseId}/qna`, {
          searchParams: {
            categories: filterType
          }
        })
        .json()
  })
  console.log('qnaData', qnaData)

  const tableData = useMemo(() => {
    return qnaData.map((qna) => {
      const matchedProblem = allProblemsMap.get(qna.problemId)
      const matchedAssignment = allTasks.find((a) => a.id === qna.groupId)
      return {
        ...qna,
        category: qna.category,
        assignmentTitle: matchedAssignment?.title,
        problemTitle: String(matchedProblem?.title),
        createdBy: {
          username: qna.createdBy?.username || 'Unknown'
        },
        createTime: new Date(qna.createTime)
      }
    })
  }, [qnaData, allTasks, allProblemsMap])

  const columns = useMemo(() => {
    if (filterType === 'General') {
      return courseQnAColumns.filter((column) => {
        if ('accessorKey' in column) {
          return (
            column.accessorKey !== 'assignmentTitle' &&
            column.accessorKey !== 'problemTitle'
          )
        }
        return true
      })
    }
    return courseQnAColumns
  }, [filterType])

  return (
    <DataTableRoot
      data={tableData}
      columns={columns}
      defaultSortState={[{ id: 'createTime', desc: true }]}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex h-[44px] w-[390px] items-center rounded-full border border-gray-200 bg-white p-1 px-[5px] py-[5px]">
          <button
            onClick={() => setFilterType('General')}
            className={cn(
              'h-full flex-1 rounded-full text-[16px] font-medium leading-6 tracking-[-0.48px] transition-all',
              filterType === 'General'
                ? 'bg-primary text-white'
                : 'text-[#808080]'
            )}
          >
            GENERAL
          </button>
          <button
            onClick={() => setFilterType('Problem')}
            className={cn(
              'h-full flex-1 rounded-full text-[16px] font-medium leading-6 tracking-[-0.48px] transition-all',
              filterType === 'Problem'
                ? 'bg-primary text-white'
                : 'text-[#808080]'
            )}
          >
            PROBLEM
          </button>
        </div>

        <DataTableSearchBar columndId="title" />
      </div>
      <DataTable getHref={(row) => `/course/${courseId}/qna/${row.id}`} />

      <DataTablePagination />
    </DataTableRoot>
  )
}
