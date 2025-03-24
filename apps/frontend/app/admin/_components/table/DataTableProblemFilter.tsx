'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  GET_ASSIGNMENT_PROBLEMS,
  GET_CONTEST_PROBLEMS
} from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { IoFilter } from 'react-icons/io5'
import { PROBLEM_COLUMN_ID } from './constants'
import { useDataTable } from './context'

const ALL_OPTION_LABEL = 'All Problems'

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
  const selectedValues = (column?.getFilterValue() as string[]) || []

  const [options, setOptions] = useState<{ value: string; label: string }[]>([])

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
    setOptions(
      sortedProblems.map((problem) => ({
        value: `${String.fromCharCode(65 + problem.order)}`,
        label: `${String.fromCharCode(65 + problem.order)}. ${problem.problem.title}`
      }))
    )
  }, [contestId, contestProblems, assignmentProblems])

  const toggleSelection = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    column?.setFilterValue(newSelection)
  }

  const toggleAll = () => {
    if (selectedValues.length === options.length) {
      column?.setFilterValue([])
    } else {
      column?.setFilterValue(options.map(({ value }) => value))
    }
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="problem-filter">
        <AccordionTrigger className="flex h-12 w-full items-center rounded-full border bg-transparent px-6">
          <div className="flex gap-2">
            <IoFilter className="mr-2 h-4 w-4" />
            Problem
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
              {selectedValues.length === 0 ||
              selectedValues.length === options.length
                ? 'ALL'
                : selectedValues.sort().join(', ')}
            </p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="rounded border bg-white p-8 text-lg">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedValues.length === options.length}
                onCheckedChange={toggleAll}
              />
              <p>{ALL_OPTION_LABEL}</p>
            </div>
            {options.map(({ value, label }) => (
              <div key={value} className="flex items-center gap-4">
                <Checkbox
                  checked={selectedValues.includes(value)}
                  onCheckedChange={() => toggleSelection(value)}
                />
                <p
                  className={cn(
                    'overflow-hidden text-ellipsis whitespace-nowrap',
                    selectedValues.includes(value) &&
                      'text-primary font-semibold'
                  )}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
