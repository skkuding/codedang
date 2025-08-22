import { Button } from '@/components/shadcn/button'
import { Calendar } from '@/components/shadcn/calendar'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { Input } from '@/components/shadcn/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { cn } from '@/libs/utils'
import { TriangleDownIcon, TriangleUpIcon } from '@radix-ui/react-icons'
import type { Column } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CalendarIcon, FilterIcon, X, Check } from 'lucide-react'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useDataTable } from './context'

const VISIBLE_COLUMN_TITLE = 'Visible'

export type FilterType = 'search' | 'multi-select' | 'date' | 'number'

type DateFilterType = 'range' | 'single'

type NumberFilterType = 'range' | 'single'

interface DataTableColumnHeaderProps<TData, TValue>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  column: Column<TData, TValue>
  title: typeof VISIBLE_COLUMN_TITLE | (string & NonNullable<unknown>)
  filterType?: FilterType
}

/**
 * 어드민 테이블의 컬럼 헤더 컴포넌트
 * @param column
 * 컬럼 정보가 담긴 객체
 * @param title
 * 헤더에 표시할 텍스트
 * @param filterType
 * 필터 타입 ('search' | 'multi-select' | 'date' | 'number'), 기본값은 'search'
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  filterType = 'search'
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [filterValue, setFilterValue] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState<string[]>([])

  const [dateFilterType, setDateFilterType] = useState<DateFilterType>('range')
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined)

  const [numberFilterType, setNumberFilterType] =
    useState<NumberFilterType>('range')
  const [numberRange, setNumberRange] = useState<{
    min: string
    max: string
  }>({
    min: '',
    max: ''
  })
  const [numberOperator, setNumberOperator] = useState<
    'eq' | 'gt' | 'lt' | 'gte' | 'lte'
  >('eq')
  const [singleNumber, setSingleNumber] = useState<string>('')

  const { table } = useDataTable<TData>()

  const canFilter = column.getCanFilter()

  const uniqueValues = useMemo(() => {
    if (!canFilter || filterType !== 'multi-select') {
      return []
    }

    const values = new Set<string>()

    table.getFilteredRowModel().rows.forEach((row) => {
      const value = row.getValue(column.id)
      if (value !== null && value !== undefined) {
        const stringValue = String(value).trim()
        if (stringValue) {
          values.add(stringValue)
        }
      }
    })

    return Array.from(values).sort()
  }, [column, canFilter, table, filterType])

  const filteredValues = useMemo(() => {
    if (!filterValue) {
      return uniqueValues
    }
    return uniqueValues.filter((value) =>
      value.toLowerCase().includes(filterValue.toLowerCase())
    )
  }, [uniqueValues, filterValue])

  const applyMultiSelectFilter = useCallback(() => {
    if (canFilter && filterType === 'multi-select') {
      if (selectedValues.length === 0) {
        column.setFilterValue('')
      } else {
        column.setFilterValue(selectedValues)
      }
    }
  }, [column, canFilter, filterType, selectedValues])

  const applyDateFilter = useCallback(() => {
    if (canFilter && filterType === 'date') {
      if (dateFilterType === 'range') {
        if (dateRange.from || dateRange.to) {
          column.setFilterValue({
            type: 'range',
            from: dateRange.from,
            to: dateRange.to
          })
        } else {
          column.setFilterValue('')
        }
      } else {
        if (singleDate) {
          column.setFilterValue({
            type: 'single',
            date: singleDate
          })
        } else {
          column.setFilterValue('')
        }
      }
    }
  }, [column, canFilter, filterType, dateFilterType, dateRange, singleDate])

  const applyNumberFilter = useCallback(() => {
    if (canFilter && filterType === 'number') {
      if (numberFilterType === 'range') {
        if (numberRange.min || numberRange.max) {
          column.setFilterValue({
            type: 'range',
            min: numberRange.min ? parseFloat(numberRange.min) : undefined,
            max: numberRange.max ? parseFloat(numberRange.max) : undefined
          })
        } else {
          column.setFilterValue('')
        }
      } else {
        if (singleNumber) {
          column.setFilterValue({
            type: 'single',
            value: parseFloat(singleNumber),
            operator: numberOperator
          })
        } else {
          column.setFilterValue('')
        }
      }
    }
  }, [
    column,
    canFilter,
    filterType,
    numberFilterType,
    numberRange,
    singleNumber,
    numberOperator
  ])

  const toggleValue = useCallback((value: string) => {
    setSelectedValues((prev) => {
      const newValues = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
      return newValues
    })
  }, [])

  const clearFilter = useCallback(() => {
    setFilterValue('')
    setSelectedValues([])
    setDateRange({ from: undefined, to: undefined })
    setSingleDate(undefined)
    setNumberRange({ min: '', max: '' })
    setSingleNumber('')
    if (canFilter) {
      column.setFilterValue('')
    }
  }, [column, canFilter])

  const handleSearchChange = useCallback(
    (value: string) => {
      setFilterValue(value)
      if (canFilter && filterType === 'search') {
        column.setFilterValue(value)
      }
    },
    [column, canFilter, filterType]
  )

  useEffect(() => {
    if (filterType === 'multi-select') {
      applyMultiSelectFilter()
    }
  }, [selectedValues, applyMultiSelectFilter, filterType])

  useEffect(() => {
    if (filterType === 'date') {
      applyDateFilter()
    }
  }, [dateRange, singleDate, dateFilterType, applyDateFilter, filterType])

  useEffect(() => {
    if (filterType === 'number') {
      applyNumberFilter()
    }
  }, [
    numberRange,
    singleNumber,
    numberOperator,
    numberFilterType,
    applyNumberFilter,
    filterType
  ])

  const isFilterActive = useMemo(() => {
    if (filterType === 'search') {
      return Boolean(column.getFilterValue())
    }

    if (filterType === 'multi-select') {
      return (column.getFilterValue() as string[])?.length > 0
    }

    if (filterType === 'date') {
      const filterValue = column.getFilterValue() as
        | {
            type: string
            from?: Date
            to?: Date
            date?: Date
          }
        | undefined

      if (dateFilterType === 'range') {
        return Boolean(filterValue?.from) || Boolean(filterValue?.to)
      }
      return Boolean(filterValue?.date)
    }

    if (filterType === 'number') {
      const filterValue = column.getFilterValue() as
        | {
            type: string
            min?: number
            max?: number
            value?: number
          }
        | undefined

      if (numberFilterType === 'range') {
        return Boolean(filterValue?.min) || Boolean(filterValue?.max)
      }
      return Boolean(filterValue?.value)
    }

    return false
  }, [column, filterType, dateFilterType, numberFilterType])

  // Title column
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          'text-center text-sm font-normal text-[#8A8A8A]',
          className
        )}
      >
        {title}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DropdownMenuTrigger asChild>
          <div className="flex w-full justify-center">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'data-[state=open]:bg-accent flex h-8 justify-center text-neutral-400',
                column.getIsSorted() ? 'text-black' : '',
                isFilterActive ? 'text-blue-600' : ''
              )}
            >
              <span className="text-sm font-normal text-[#8A8A8A]">
                {title}
              </span>
              {(() => {
                const sort = column.getIsSorted()
                if (sort === 'desc') {
                  return <TriangleDownIcon className="ml-2 h-4 w-4" />
                }
                if (sort === 'asc') {
                  return <TriangleUpIcon className="ml-2 h-4 w-4" />
                }
                return (
                  <div>
                    <TriangleUpIcon className="-mb-2.5 ml-2 h-4 w-4" />
                    <TriangleDownIcon className="-mt- ml-2 h-4 w-4" />
                  </div>
                )
              })()}
              {isFilterActive ? (
                <FilterIcon className="ml-1 h-3 w-3 text-blue-600" />
              ) : null}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-96 w-80 overflow-hidden"
        >
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <TriangleUpIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {title === VISIBLE_COLUMN_TITLE ? 'Hidden first' : 'Asc'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <TriangleDownIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            {title === VISIBLE_COLUMN_TITLE ? 'Visible first' : 'Desc'}
          </DropdownMenuItem>

          {canFilter && (
            <>
              <DropdownMenuSeparator />
              <div className="p-3">
                {(() => {
                  if (filterType === 'search') {
                    return (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Search ${title}...`}
                          value={filterValue}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="h-8"
                        />
                        {filterValue && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilter}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  }

                  if (filterType === 'date') {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={dateFilterType}
                            onValueChange={(value: DateFilterType) =>
                              setDateFilterType(value)
                            }
                          >
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="range">Range</SelectItem>
                              <SelectItem value="single">Single</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilter}
                            className="h-8 px-2 text-xs"
                          >
                            Reset
                          </Button>
                        </div>

                        {dateFilterType === 'range' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-8 justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from
                                      ? format(dateRange.from, 'PPP')
                                      : 'Start Date'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={dateRange.from}
                                    onSelect={(date) =>
                                      setDateRange((prev) => ({
                                        ...prev,
                                        from: date
                                      }))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <span className="text-sm">~</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-8 justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.to
                                      ? format(dateRange.to, 'PPP')
                                      : 'End Date'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={dateRange.to}
                                    onSelect={(date) =>
                                      setDateRange((prev) => ({
                                        ...prev,
                                        to: date
                                      }))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="h-8 w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {singleDate
                                    ? format(singleDate, 'PPP')
                                    : 'Select Date'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={singleDate}
                                  onSelect={setSingleDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>
                    )
                  }

                  if (filterType === 'number') {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={numberFilterType}
                            onValueChange={(value: NumberFilterType) =>
                              setNumberFilterType(value)
                            }
                          >
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="range">Range</SelectItem>
                              <SelectItem value="single">Single</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilter}
                            className="h-8 px-2 text-xs"
                          >
                            Reset
                          </Button>
                        </div>

                        {numberFilterType === 'range' ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Min Value"
                                value={numberRange.min}
                                onChange={(e) =>
                                  setNumberRange((prev) => ({
                                    ...prev,
                                    min: e.target.value
                                  }))
                                }
                                className="h-8"
                                type="number"
                              />
                              <span className="text-sm">~</span>
                              <Input
                                placeholder="Max Value"
                                value={numberRange.max}
                                onChange={(e) =>
                                  setNumberRange((prev) => ({
                                    ...prev,
                                    max: e.target.value
                                  }))
                                }
                                className="h-8"
                                type="number"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Select
                                value={numberOperator}
                                onValueChange={(
                                  value: 'eq' | 'gt' | 'lt' | 'gte' | 'lte'
                                ) => setNumberOperator(value)}
                              >
                                <SelectTrigger className="h-8 w-16">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="eq">=</SelectItem>
                                  <SelectItem value="gt">&gt;</SelectItem>
                                  <SelectItem value="gte">&gt;=</SelectItem>
                                  <SelectItem value="lt">&lt;</SelectItem>
                                  <SelectItem value="lte">&lt;=</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Value"
                                value={singleNumber}
                                onChange={(e) =>
                                  setSingleNumber(e.target.value)
                                }
                                className="h-8"
                                type="number"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <>
                      <div className="mb-3">
                        <Input
                          placeholder={`Search ${title}...`}
                          value={filterValue}
                          onChange={(e) => setFilterValue(e.target.value)}
                          className="h-8"
                        />
                      </div>

                      {selectedValues.length > 0 && (
                        <div className="mb-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {selectedValues.length} Selected
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilter}
                              className="h-6 px-2 text-xs"
                            >
                              Reset
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedValues.map((value) => (
                              <div
                                key={value}
                                className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                              >
                                <span className="max-w-20 truncate">
                                  {value}
                                </span>
                                <button
                                  onClick={() => toggleValue(value)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="max-h-48 overflow-y-auto">
                        {filteredValues.length > 0 ? (
                          filteredValues.map((value) => (
                            <div
                              key={value}
                              className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-100"
                              onClick={() => toggleValue(value)}
                            >
                              <Checkbox
                                checked={selectedValues.includes(value)}
                                className="h-4 w-4"
                              />
                              <span className="flex-1 truncate text-sm">
                                {value}
                              </span>
                              {selectedValues.includes(value) && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-gray-500">
                            {filterValue ? 'No results found' : 'No values'}
                          </div>
                        )}
                      </div>

                      {filteredValues.length > 0 && (
                        <div className="mt-3 border-t pt-3">
                          <div className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-100">
                            <Checkbox
                              checked={filteredValues.every((value) =>
                                selectedValues.includes(value)
                              )}
                              ref={(el) => {
                                if (el && el instanceof HTMLInputElement) {
                                  el.indeterminate =
                                    filteredValues.some((value) =>
                                      selectedValues.includes(value)
                                    ) &&
                                    !filteredValues.every((value) =>
                                      selectedValues.includes(value)
                                    )
                                }
                              }}
                              className="h-4 w-4"
                              onClick={(e) => {
                                e.stopPropagation()
                                const allSelected = filteredValues.every(
                                  (value) => selectedValues.includes(value)
                                )
                                if (allSelected) {
                                  setSelectedValues((prev) =>
                                    prev.filter(
                                      (v) => !filteredValues.includes(v)
                                    )
                                  )
                                } else {
                                  setSelectedValues((prev) => [
                                    ...new Set([...prev, ...filteredValues])
                                  ])
                                }
                              }}
                            />
                            <span className="text-sm font-medium">
                              {filteredValues.every((value) =>
                                selectedValues.includes(value)
                              )
                                ? 'Reset'
                                : 'Select all'}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
