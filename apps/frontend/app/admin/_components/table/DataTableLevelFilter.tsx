'use client'

import { levels } from '@/lib/constants'
import DataTableMultiSelectFilter from './DataTableMultiSelectFilter'
import { LEVEL_COLUMN_ID } from './constants'
import { useDataTable } from './context'

export default function DataTableLevelFilter() {
  const { table } = useDataTable()

  return (
    <DataTableMultiSelectFilter
      column={table.getColumn(LEVEL_COLUMN_ID)}
      title="Level"
      options={levels.map((item) => ({
        value: item,
        label: `Level ${item.slice(-1)}`
      }))}
    />
  )
}
