'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { DateTimePickerDemo } from '@/components/shadcn/date-time-picker-demo'
import { Switch } from '@/components/shadcn/switch'
import type { ColumnDef } from '@tanstack/react-table'
import type { AssignmentProblem } from '../_libs/type'

export const createColumns = (
  revealedStates: { [key: number]: boolean },
  handleSwitchChange: (rowIndex: number) => void,
  optionStates: { [key: number]: string },
  handleOptionChange: (rowIndex: number, value: string) => void,
  handleTimeFormChange: (rowIndex: number, date: Date | null) => void,
  solutionReleaseTimes: { [key: number]: Date | null }
): ColumnDef<AssignmentProblem>[] => {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="w-[469px] overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {row.getValue('title')}
          </p>
        </div>
      )
    },
    {
      accessorKey: 'reveal',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reveal" />
      ),
      cell: ({ row }) => (
        <div className="flex w-[70px] justify-center">
          <Switch
            checked={revealedStates[row.index] || false}
            onCheckedChange={() => handleSwitchChange(row.index)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'options',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Options" />
      ),
      cell: ({ row }) => {
        const selectedOption = optionStates[row.index]
        return revealedStates[row.index] ? (
          <div className="flex w-[340px] items-start gap-2">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                className="text-primary-light text-xs"
                checked={selectedOption === 'After Due Date'}
                onChange={() => handleOptionChange(row.index, 'After Due Date')}
              />
              <p>After Due Date</p>
            </label>
            <div className="flex w-[180px] flex-col items-center justify-start gap-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  className="text-primary-light text-xs"
                  checked={selectedOption === 'Manually'}
                  onChange={() => handleOptionChange(row.index, 'Manually')}
                />
                <p>Manually</p>
              </label>

              {selectedOption === 'Manually' && (
                <DateTimePickerDemo
                  onChange={(date) => handleTimeFormChange(row.index, date)}
                  defaultValue={solutionReleaseTimes[row.index] || undefined}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="w-[270px]" />
        )
      },
      enableSorting: false,
      enableHiding: false
    }
  ]
}
