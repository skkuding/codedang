'use client'

import { languages } from '@/lib/constants'
import DataTableMultiSelectFilter from './DataTableMultiSelectFilter'
import { LANG_COLUMN_ID } from './constants'
import { useDataTable } from './context'

export default function DataTableLangFilter() {
  const { table } = useDataTable()

  return (
    <DataTableMultiSelectFilter
      column={table.getColumn(LANG_COLUMN_ID)}
      title="Languages"
      options={languages.map((item) => ({ value: item, label: item }))}
    />
  )
}
