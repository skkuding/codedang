import { GET_TAGS } from '@/app/admin/problem/utils'
import { useQuery } from '@apollo/client'
import DataTableLangFilter from './DataTableLangFilter'
import { DataTableTagsFilter } from './DataTableTagsFilter'

interface DataTableAdminFilterProps {
  table: any
}

const languageOptions = ['C', 'Cpp', 'Golang', 'Java', 'Python2', 'Python3']

export default function DataTableAdminFilter({
  table
}: DataTableAdminFilterProps) {
  const { data: tagsData } = useQuery(GET_TAGS)
  const tags =
    tagsData?.getTags.map(({ id, name }) => ({ id: +id, name })) ?? []

  return (
    <div className="flex gap-2">
      {table.getColumn('languages') && (
        <DataTableLangFilter
          column={table.getColumn('languages')}
          title="Languages"
          options={languageOptions}
        />
      )}
      {table.getColumn('tag') && (
        <DataTableTagsFilter
          column={table.getColumn('tag')}
          title="Tags"
          options={tags}
        />
      )}
    </div>
  )
}
