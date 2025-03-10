'use client'

import { Button } from '@/components/shadcn/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/shadcn/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import {
  GET_ASSIGNMENT_PROBLEMS,
  GET_CONTEST_PROBLEMS
} from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { FaCheck, FaChevronDown } from 'react-icons/fa'
import { PROBLEM_COLUMN_ID } from './constants'
import { useDataTable } from './context'

const ALL_OPTION_LABEL = 'All Problems'

/**
 * 어드민 테이블의 문제 필터
 * @description 컬럼 아이디가 "problemTitle" 여야 합니다.
 * @param contestId
 * 문제를 가져올 대회의 아이디
 */
export function DataTableProblemFilter({
  contestId = 0,
  groupId = 0,
  assignmentId = 0
}: {
  contestId?: number
  groupId?: number
  assignmentId?: number
}) {
  const { table } = useDataTable()
  const column = table.getColumn(PROBLEM_COLUMN_ID)
  const selectedValue = getSelectedValue(column?.getFilterValue())

  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<
    { value: string | null; label: string }[]
  >([])

  const contestProblems = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId },
    skip: Boolean(groupId)
  })

  const assignmentProblems = useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId, assignmentId },
    skip: Boolean(contestId)
  })

  useEffect(() => {
    const data = contestId
      ? contestProblems?.data?.getContestProblems
      : assignmentProblems?.data?.getAssignmentProblems
    const sortedProblems = data?.slice().sort((a, b) => a.order - b.order) ?? []
    setOptions([
      { value: null, label: ALL_OPTION_LABEL },
      ...sortedProblems.map((problem) => ({
        value: problem.problem.title,
        label: `${String.fromCharCode(65 + problem.order)}. ${problem.problem.title}`
      }))
    ])
  }, [contestId, contestProblems, assignmentProblems])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-[250px] p-0" asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="flex h-10 justify-between border px-4 hover:bg-gray-50"
        >
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
            {selectedValue || 'All Problems'}
          </p>
          <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map(({ value, label }) => (
                <CommandItem
                  key={value}
                  className="flex items-center justify-between"
                  onSelect={() => {
                    column?.setFilterValue(value)
                    setOpen(false)
                    table.resetPageIndex()
                  }}
                >
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                    {label}
                  </p>
                  <FaCheck
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      selectedValue === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const getSelectedValue = (data: unknown): string | null => {
  if (typeof data !== 'string') {
    return null
  }
  return data
}
