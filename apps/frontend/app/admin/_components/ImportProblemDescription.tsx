'use client'

import { useDataTable } from './table/context'

export function ImportProblemDescription() {
  const { table } = useDataTable()

  return (
    <p className="text-primary pb-2 text-sm font-normal">
      {table.getFilteredSelectedRowModel().rows.length} problem(s) selected:{' '}
      {table
        .getFilteredSelectedRowModel()
        .rows.map((row) => {
          const original = row.original as { title: string }
          return original.title
        })
        .join(', ')}
    </p>
  )
}
