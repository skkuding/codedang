import { DELETE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import { DataTableDeleteButton } from '../../_components/table/DataTableDeleteButton'
import { useDataTable } from '../../_components/table/context'
import type { DataTableCourse } from './Columns'

interface DeleteCourseButtonProps {
  onSuccess?: () => void
}

export function DeleteCourseButton({ onSuccess }: DeleteCourseButtonProps) {
  const { table } = useDataTable<DataTableCourse>()
  const [deleteCourse] = useMutation(DELETE_COURSE)

  const deleteTarget = (id: number) => {
    return deleteCourse({
      variables: {
        groupId: id
      }
    })
  }

  const selectedRows = table.getSelectedRowModel().flatRows

  const deleteItems: string[] = Array.from(
    new Map(
      table.getSelectedRowModel().flatRows.flatMap((row) => {
        const course = row.original

        const items =
          course.type === 'master'
            ? [course, ...(course.sections ?? [])]
            : [course]

        return items.map((item) => [
          `${item.type}-${item.id}`,
          `${item.title} [${item.code}] - ${item.type === 'master' ? 'M' : item.classNum}`
        ])
      })
    ).values()
  )

  const deleteDescriptions = selectedRows
    .filter((row) => row.depth === 0 && row.original.type === 'master')
    .map(
      (row) =>
        `'${row.getValue('title')} [${row.getValue('code')}]'을(를) 삭제하면 하위 분반 ${row.subRows.length}개와 각 분반의 수강생·제출 기록이 모두 삭제되며, 복구할 수 없습니다.`
    )
    .join('\n')

  return (
    <DataTableDeleteButton
      target="course"
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
      size="md"
      className="ml-auto"
      deleteItems={deleteItems}
      description={deleteDescriptions}
    />
  )
}
