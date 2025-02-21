import { DataTableFallback } from '@/components/table/DataTableFallback'
import { DataTablePagination } from '@/components/table/DataTablePagination'
import { DataTableRoot } from '@/components/table/DataTableRoot'
import { DataTableWithToggle } from '@/components/table/DataTableWithToggle'
// import { useSuspenseQuery } from '@apollo/client'
import { columns, type Assignment } from './AssignmentTableColumns'

export function AssignmentTable() {
  // TODO: api 만들어지면 작성에정
  // const { data } = useSuspenseQuery(GET_PROBLEMS, {
  //   variables: {
  //     groupId: 1,
  //     take: 500,
  //     input: {
  //       difficulty: [
  //         Level.Level1,
  //         Level.Level2,
  //         Level.Level3,
  //         Level.Level4,
  //         Level.Level5
  //       ],
  //       languages: [Language.C, Language.Cpp, Language.Java, Language.Python3]
  //     }
  //   }
  // })

  // const assignments = data.getAssignments.map((assignment) => ({
  //   ...assignment
  // }))
  const assignments: Assignment[] = [
    {
      id: 1,
      title: '1주차 과제',
      due: '2025-02-20',
      week: 1,
      problems: [
        {
          id: 1,
          title: '정수 더하기',
          mean: 1.5,
          max: 2,
          min: 0,
          score: 2,
          isSubmitted: true
        }
      ]
    },
    {
      id: 2,
      title: '2주차 과제',
      due: '2025-02-25',
      week: 2,
      problems: [
        {
          id: 2,
          title: '가파른 경사',
          mean: 3,
          max: 9,
          min: 1,
          score: 9,
          isSubmitted: true
        },
        {
          id: 3,
          title: '스꾸딩 크리스마스 트리 만들기',
          mean: 1.5,
          max: 2,
          min: 0,
          score: 0,
          isSubmitted: false
        }
      ]
    }
  ]

  return (
    <DataTableRoot
      data={assignments}
      columns={columns}
      defaultSortState={[{ id: 'title', desc: true }]}
    >
      <DataTableWithToggle getHref={(data) => `/admin/problem/${data.id}`} />
      <DataTablePagination showSelection />
    </DataTableRoot>
  )
}

export function ProblemTableFallback() {
  return <DataTableFallback columns={columns} />
}
