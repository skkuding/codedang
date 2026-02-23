'use client'

import { useTranslate } from '@tolgee/react'
import { DataTableMultiSelectFilter } from './DataTableMultiSelectFilter'
import { SEMESTER_COLUMN_ID } from './constants'
import { useDataTable } from './context'

interface DataTableSemesterFilterProps {
  semesters: string[]
}

export function DataTableSemesterFilter({
  semesters
}: DataTableSemesterFilterProps) {
  const { t } = useTranslate()
  const { table } = useDataTable()

  return (
    <DataTableMultiSelectFilter
      column={table.getColumn(SEMESTER_COLUMN_ID)}
      title={t('semester_title')}
      options={semesters.map((item) => ({ value: item, label: item }))}
    />
  )
}
