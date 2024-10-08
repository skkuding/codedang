'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { FaCheck, FaChevronDown } from 'react-icons/fa'
import { PROBLEM_COLUMN_ID } from './constants'
import { useDataTable } from './context'

const ALL_OPTION = 'All Problems'

/**
 * 어드민 테이블의 문제 필터
 * @description 컬럼 아이디가 "problemTitle" 여야 합니다.
 * @param contestId
 * 문제를 가져올 대회의 아이디
 */
export default function DataTableProblemFilter({
  contestId
}: {
  contestId: number
}) {
  const { table } = useDataTable()
  const column = table.getColumn(PROBLEM_COLUMN_ID)

  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined
  )
  const [problemFilterOpen, setProblemFilterOpen] = useState(false)
  const [problems, setProblems] = useState<string[]>([])

  const { data } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { groupId: 1, contestId }
  })

  useEffect(() => {
    const sortedProblems =
      data?.getContestProblems.slice().sort((a, b) => a.order - b.order) ?? []
    setProblems([
      'All Problems',
      ...sortedProblems.map(
        (problem) =>
          `${String.fromCharCode(65 + problem.order)}. ${problem.problem.title}`
      )
    ])
  }, [data])

  return (
    <Popover open={problemFilterOpen} onOpenChange={setProblemFilterOpen}>
      <PopoverTrigger className="w-[250px] p-0" asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="flex h-10 justify-between border px-4 hover:bg-gray-50"
        >
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
            {selectedValue ?? 'All Problems'}
          </p>
          <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {problems.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  className="flex items-center justify-between"
                  onSelect={() => {
                    option === 'All Problems'
                      ? column?.setFilterValue(null)
                      : column?.setFilterValue(option.slice(3))
                    setProblemFilterOpen(false)
                    setSelectedValue(option)
                  }}
                >
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
                    {option}
                  </p>
                  <FaCheck
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      selectedValue === option ||
                        (!selectedValue && option === ALL_OPTION)
                        ? 'opacity-100'
                        : 'opacity-0'
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
