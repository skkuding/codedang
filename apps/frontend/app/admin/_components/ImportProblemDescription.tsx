'use client'

import { useTranslate } from '@tolgee/react'
import { useDataTable } from './table/context'

export function ImportProblemDescription() {
  const { table } = useDataTable()
  const { t } = useTranslate()

  return (
    <p className="text-sm font-normal">
      <span className="text-primary">
        {t('problems_selected_label', {
          count: table.getFilteredSelectedRowModel().rows.length
        })}
        :{' '}
      </span>
      <span className="text-[#8A8A8A]">
        {table
          .getFilteredSelectedRowModel()
          .rows.map((row) => {
            const original = row.original as { title: string }
            return original.title
          })
          .join(', ')}
      </span>
    </p>
  )
}
