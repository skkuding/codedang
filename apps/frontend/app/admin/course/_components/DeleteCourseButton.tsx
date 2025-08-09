import { DELETE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import { DataTableDeleteButton } from '../../_components/table/DataTableDeleteButton'
import { useDataTable } from '../../_components/table/context'

interface DeleteCourseButtonProps {
  onSuccess?: () => void
}

export function DeleteCourseButton({ onSuccess }: DeleteCourseButtonProps) {
  const { table } = useDataTable()
  const [deleteCourse] = useMutation(DELETE_COURSE)

  const deleteTarget = (id: number) => {
    return deleteCourse({
      variables: {
        groupId: id
      }
    })
  }

  return (
    <DataTableDeleteButton
      target="course"
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
      className="ml-auto"
      deleteItems={table
        .getSelectedRowModel()
        .rows.map(
          (row) => `${row.getValue('title')} [${row.getValue('code')}]`
        )}
    />
  )
}
