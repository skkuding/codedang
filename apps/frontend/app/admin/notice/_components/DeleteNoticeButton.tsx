import { DELETE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import { DataTableDeleteButton } from '../../_components/table/DataTableDeleteButton'
import { useDataTable } from '../../_components/table/context'

interface DeleteNoticeButtonProps {
  onSuccess?: () => void
}

export function DeleteNoticeButton({ onSuccess }: DeleteNoticeButtonProps) {
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
        .rows.map((row) => row.getValue('title'))}
    />
  )
}
