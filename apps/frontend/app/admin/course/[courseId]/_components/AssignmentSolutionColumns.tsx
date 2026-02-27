'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { DateTimePickerDemo } from '@/components/shadcn/date-time-picker-demo'
import { Switch } from '@/components/shadcn/switch'
import type { ColumnDef } from '@tanstack/react-table'
import type { AssignmentProblem } from '../_libs/type'

export const createColumns = (
  revealedStates: { [problemId: number]: boolean },
  handleSwitchChange: (problemId: number) => void,
  optionStates: { [problemId: number]: string },
  handleOptionChange: (problemId: number, value: string) => void,
  handleTimeFormChange: (problemId: number, date: Date | null) => void,
  solutionReleaseTimes: { [problemId: number]: Date | null }
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
            checked={revealedStates[row.original.id] || false}
            onCheckedChange={() => handleSwitchChange(row.original.id)}
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
        const selectedOption = optionStates[row.original.id]
        return revealedStates[row.original.id] ? (
          <div className="flex w-[340px] items-start gap-2">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                className="text-primary-light text-caption4_r_12"
                checked={selectedOption === 'After Due Date'}
                onChange={() =>
                  handleOptionChange(row.original.id, 'After Due Date')
                }
              />
              <p>After Due Date</p>
            </label>
            <div className="flex w-[180px] flex-col items-center justify-start gap-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  className="text-primary-light text-caption4_r_12"
                  checked={selectedOption === 'Manually'}
                  onChange={() =>
                    handleOptionChange(row.original.id, 'Manually')
                  }
                />
                <p>Manually</p>
              </label>

              {selectedOption === 'Manually' && (
                <DateTimePickerDemo
                  onChange={(date) =>
                    handleTimeFormChange(row.original.id, date)
                  }
                  defaultValue={
                    solutionReleaseTimes[row.original.id] || undefined
                  }
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
