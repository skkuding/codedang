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
import type { Column } from '@tanstack/react-table'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { FaCheck, FaChevronDown } from 'react-icons/fa'

interface DataTableProblemFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
}

export default function DataTableLevelFilter<TData, TValue>({
  column
}: DataTableProblemFilterProps<TData, TValue>) {
  const { id } = useParams()
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined
  )
  const [problemFilterOpen, setProblemFilterOpen] = useState(false)
  const [problems, setProblems] = useState<string[]>([])

  useQuery(GET_CONTEST_PROBLEMS, {
    variables: { groupId: 1, contestId: Number(id) },
    onCompleted: (problemData) => {
      const data = problemData.getContestProblems
      const sortedData = data.slice().sort((a, b) => a.order - b.order)
      setProblems([
        'All Problems',
        ...sortedData.map(
          (problem) =>
            `${String.fromCharCode(65 + problem.order)}. ${problem.problem.title}`
        )
      ])
    }
  })

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
                        (!selectedValue && option == 'All Problems')
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
