'use client'

import { DataTableMultiSelectFilter } from './DataTableMultiSelectFilter'
import { SEMESTER_COLUMN_ID } from './constants'
import { useDataTable } from './context'

interface DataTableSemesterFilterProps {
  semesters: string[]
}

export function DataTableSemesterFilter({
  semesters
}: DataTableSemesterFilterProps) {
  const { table } = useDataTable()

  return (
    <DataTableMultiSelectFilter
      column={table.getColumn(SEMESTER_COLUMN_ID)}
      title="Semester"
      options={semesters.map((item) => ({ value: item, label: item }))}
    />
  )
}
