'use client'

import { Button } from '@/components/shadcn/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { useEffect, useState } from 'react'
import { FaSort } from 'react-icons/fa'
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
        <Button
          variant="outline"
          className="h-12 rounded-full bg-transparent px-6 text-neutral-500"
        >
          <div className="flex items-center gap-2">
            <FaSort className="h-4 w-4" />
            Order by
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
            <h4 className="text-body2_m_14 mb-2">Column</h4>
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
                  <label htmlFor={`column-${id}`} className="text-body4_r_14">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-body2_m_14 mb-2">Direction</h4>
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
                <label
                  htmlFor="sort-asc"
                  className="text-body4_r_14 flex items-center"
                >
                  Ascending
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
                  className="text-body4_r_14 flex items-center"
                >
                  Descending
                </label>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
