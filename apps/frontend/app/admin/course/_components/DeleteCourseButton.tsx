import { DELETE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { useApolloClient, useMutation } from '@apollo/client'
import { DataTableDeleteButton } from '../../_components/table/DataTableDeleteButton'
import { useDataTable } from '../../_components/table/context'

export function DeleteCourseButton() {
  const client = useApolloClient()
  const { table } = useDataTable()
  const [deleteCourse] = useMutation(DELETE_COURSE)

  const deleteTarget = (id: number) => {
    return deleteCourse({
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
    <DataTableDeleteButton
      target="course"
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
      className="ml-auto"
    >
      <ul className="list-disc space-y-2 pl-5">
        {table.getSelectedRowModel().rows.map((row) => (
          <li key={row.id} className="text-base font-normal text-neutral-500">
            {row.getValue('title')} [{row.getValue('code')}]
          </li>
        ))}
      </ul>
    </DataTableDeleteButton>
  )
}
