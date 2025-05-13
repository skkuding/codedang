import { DataTable, DataTableRoot } from '@/app/admin/_components/table'
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import type { AssignmentProblem } from '../_libs/type'
import { createColumns } from './AssignmentSolutionColumns'

interface AssignmentSolutionTableProps {
  problems: AssignmentProblem[]
  setProblems: Dispatch<SetStateAction<AssignmentProblem[]>>
}

export function AssignmentSolutionTable({
  problems,
  setProblems
}: AssignmentSolutionTableProps) {
  const [revealedStates, setRevealedStates] = useState<{
    [key: number]: boolean
  }>({})
  const [optionStates, setOptionStates] = useState<{ [key: number]: string }>(
    {}
  )
  const [solutionReleaseTimes, setSolutionReleaseTimes] = useState<{
    [key: number]: Date | null
  }>({})

  const handleSwitchChange = (rowIndex: number) => {
    setRevealedStates((prev) => {
      const newState = !prev[rowIndex]

      setProblems((prevProblems) =>
        prevProblems.map((problem, index) =>
          index === rowIndex
            ? {
                ...problem,
                solutionReleaseTime: null
              }
            : problem
        )
      )

      setOptionStates((prev) => ({
        ...prev,
        [rowIndex]: ''
      }))

      return { ...prev, [rowIndex]: newState }
    })
  }

  const handleOptionChange = (rowIndex: number, value: string) => {
    setOptionStates((prev) => {
      const newState = { ...prev, [rowIndex]: value }
      const dummyReleaseTime = new Date('2025-01-01')

      // 일단 2025-01-01로 해두고 Create 할 때 endTime으로 갈아끼우기기
      if (value === 'After Deadline') {
        setSolutionReleaseTimes((prev) => ({
          ...prev,
          [rowIndex]: new Date('2025-01-01')
        }))
        setProblems((prevProblems) =>
          prevProblems.map((problem, index) =>
            index === rowIndex
              ? {
                  ...problem,
                  solutionReleaseTime: dummyReleaseTime
                }
              : problem
          )
        )
      }
      return newState
    })
  }

  const handleTimeFormChange = (rowIndex: number, date: Date | null) => {
    setSolutionReleaseTimes((prev) => {
      const newState = { ...prev, [rowIndex]: date }
      setProblems((prevProblems) =>
        prevProblems.map((problem, index) =>
          index === rowIndex
            ? {
                ...problem,
                solutionReleaseTime: date
              }
            : problem
        )
      )
      return newState
    })
  }

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => problem.solution)
  }, [problems])

  const columns = useMemo(
    () =>
      createColumns(
        revealedStates,
        handleSwitchChange,
        optionStates,
        handleOptionChange,
        handleTimeFormChange,
        solutionReleaseTimes
      ),
    [revealedStates, optionStates]
  )

  return (
    <DataTableRoot
      columns={columns}
      data={filteredProblems}
      defaultPageSize={20}
      defaultSortState={[{ id: 'order', desc: false }]}
    >
      <DataTable />
    </DataTableRoot>
  )
}
