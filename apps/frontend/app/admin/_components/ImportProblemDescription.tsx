'use client'

import { useDataTable } from './table/context'

export function ImportProblemDescription() {
  const { table } = useDataTable()

  return (
    <p className="text-sm font-normal">
      <span className="text-primary">
        {table.getFilteredSelectedRowModel().rows.length} problem(s)
        selected:{' '}
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
