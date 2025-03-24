'use client'

import { Button } from '@/components/shadcn/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { useEffect, useState } from 'react'
import { TbSortAscending, TbSortDescending } from 'react-icons/tb'
import { useDataTable } from './context'

export function DataTableSortButton({
  columnIds = []
}: {
  columnIds: string[]
}) {
  const { table } = useDataTable()
  const [open, setOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const columns = columnIds
    .map((id) => ({
      id,
      column: table.getColumn(id),
      label: id
    }))
    .filter((item) => item.column)

  useEffect(() => {
    const sortingState = table.getState().sorting
    if (sortingState.length > 0) {
      const currentSort = sortingState[0]
      setSelectedColumn(currentSort.id)
      setSortOrder(currentSort.desc ? 'desc' : 'asc')
    }
  }, [table])

  useEffect(() => {
    if (selectedColumn) {
      applySort(selectedColumn, sortOrder)
    }
  }, [selectedColumn, sortOrder])

  const applySort = (columnId: string, order: 'asc' | 'desc') => {
    if (!columnId) {
      return
    }

    table.setSorting([
      {
        id: columnId,
        desc: order === 'desc'
      }
    ])

    setSelectedColumn(columnId)
    setSortOrder(order)
  }

  const handleColumnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColumn(event.target.value)
  }

  const handleOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSortOrder(event.target.value as 'asc' | 'desc')
  }

  const handleApply = () => {
    if (selectedColumn) {
      applySort(selectedColumn, sortOrder)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 rounded-full px-6">
          <div className="flex items-center gap-2">
            {sortOrder === 'asc' ? (
              <TbSortAscending className="mr-2 h-4 w-4" />
            ) : (
              <TbSortDescending className="mr-2 h-4 w-4" />
            )}
            Sort
            {selectedColumn && (
              <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
                {columns.find((c) => c.id === selectedColumn)?.label ||
                  selectedColumn}
                ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
              </p>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Column</h4>
            <div className="space-y-2">
              {columns.map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`column-${id}`}
                    name="sortColumn"
                    value={id}
                    checked={selectedColumn === id}
                    onChange={handleColumnChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={`column-${id}`} className="text-sm">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium">Direction</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="sort-asc"
                  name="sortOrder"
                  value="asc"
                  checked={sortOrder === 'asc'}
                  onChange={handleOrderChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <label htmlFor="sort-asc" className="flex items-center text-sm">
                  <TbSortAscending className="mr-2 h-4 w-4" /> Ascending
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="sort-desc"
                  name="sortOrder"
                  value="desc"
                  checked={sortOrder === 'desc'}
                  onChange={handleOrderChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <label
                  htmlFor="sort-desc"
                  className="flex items-center text-sm"
                >
                  <TbSortDescending className="mr-2 h-4 w-4" /> Descending
                </label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
