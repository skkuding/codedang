import { DELETE_NOTICE } from '@/graphql/notice/mutation'
import { useMutation } from '@apollo/client'
import { DataTableDeleteButton } from '../../_components/table/DataTableDeleteButton'
import { useDataTable } from '../../_components/table/context'

interface DeleteNoticeButtonProps {
  onSuccess?: () => void
}

export function DeleteNoticeButton({ onSuccess }: DeleteNoticeButtonProps) {
  const { table } = useDataTable()
  const [deleteNotice] = useMutation(DELETE_NOTICE)

  const deleteTarget = (id: number) => {
    return deleteNotice({
      variables: {
        noticeId: id
      }
    })
  }

  return (
    <DataTableDeleteButton
      target="notice"
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
      className="ml-auto"
      deleteItems={table
        .getSelectedRowModel()
        .rows.map((row) => row.getValue('title'))}
    />
  )
}
