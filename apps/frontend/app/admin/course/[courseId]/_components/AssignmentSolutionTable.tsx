import { PrevNextProblemButton } from '@/app/(client)/(main)/contest/[contestId]/@tabs/_components/PrevNextProblemButton'
import { DataTable, DataTableRoot } from '@/app/admin/_components/table'
import { options } from '@fullcalendar/core/preact.js'
import dayjs from 'dayjs'
import { setSourceMapsEnabled } from 'process'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react'
import type { AssignmentProblem } from '../_libs/type'
import { createColumns } from './AssignmentSolutionColumns'

interface AssignmentSolutionTableProps {
  problems: AssignmentProblem[]
  setProblems: Dispatch<SetStateAction<AssignmentProblem[]>>
  dueTime?: Date
}

export function AssignmentSolutionTable({
  problems,
  setProblems,
  dueTime
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
  const [manualReleaseTimes, setManualReleaseTimes] = useState<{
    [key: number]: Date | null
  }>({})

  const hasProblemsLoaded = useRef(false)

  useEffect(() => {
    if (!hasProblemsLoaded.current && problems.length > 0) {
      const newRevealedStates: { [key: number]: boolean } = {}
      const newOptionStates: { [key: number]: string } = {}
      const newSolutionReleaseTimes: { [key: number]: Date | null } = {}
      const newManualReleaseTimes: { [key: number]: Date | null } = {}

      problems.forEach((problem, index) => {
        if (problem.solutionReleaseTime) {
          newRevealedStates[index] = true
        }

        if (problem.solutionReleaseTime === null) {
          newOptionStates[index] = ''
        } else if (
          dayjs(problem.solutionReleaseTime).toString() ===
          dayjs(dueTime)?.toString()
        ) {
          newOptionStates[index] = 'After Due Date'
        } else {
          newOptionStates[index] = 'Manually'
          newSolutionReleaseTimes[index] = problem.solutionReleaseTime
          newManualReleaseTimes[index] = problem.solutionReleaseTime
        }
      })

      setRevealedStates(newRevealedStates)
      setOptionStates(newOptionStates)
      setSolutionReleaseTimes(newSolutionReleaseTimes)
      setManualReleaseTimes(newManualReleaseTimes)

      hasProblemsLoaded.current = true
    }
  }, [problems])

  const handleSwitchChange = (rowIndex: number) => {
    const newState = !revealedStates[rowIndex]
    const prevOption = optionStates[rowIndex]
    const prevManualTime = manualReleaseTimes[rowIndex]

    if (newState) {
      if (prevOption === 'Manually' && prevManualTime) {
        setProblems((prevProblems) =>
          prevProblems.map((problem, index) =>
            index === rowIndex
              ? {
                  ...problem,
                  solutionReleaseTime: prevManualTime
                }
              : problem
          )
        )
        setSolutionReleaseTimes((prev) => ({
          ...prev,
          [rowIndex]: prevManualTime
        }))
        setOptionStates((prev) => ({
          ...prev,
          [rowIndex]: 'Manually'
        }))
      } else if (prevOption === 'After Due Date') {
        const dummyReleaseTime = new Date('2025-01-01')
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
        setSolutionReleaseTimes((prev) => ({
          ...prev,
          [rowIndex]: dummyReleaseTime
        }))
        setOptionStates((prev) => ({
          ...prev,
          [rowIndex]: 'After Due Date'
        }))
      } else {
        const dummyReleaseTime = new Date('2025-01-01')
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
        setSolutionReleaseTimes((prev) => ({
          ...prev,
          [rowIndex]: dummyReleaseTime
        }))
        setOptionStates((prev) => ({
          ...prev,
          [rowIndex]: 'After Due Date'
        }))
      }
    } else {
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
      setSolutionReleaseTimes((prev) => ({
        ...prev,
        [rowIndex]: null
      }))
      setOptionStates((prev) => ({
        ...prev,
        [rowIndex]: ''
      }))
    }
    setRevealedStates((prev) => ({
      ...prev,
      [rowIndex]: newState
    }))
  }

  const handleOptionChange = (rowIndex: number, value: string) => {
    setOptionStates((prev) => {
      const newState = { ...prev, [rowIndex]: value }
      const dummyReleaseTime = new Date('2025-01-01')

      // 일단 2025-01-01로 해두고 Create 할 때 dueTime으로 갈아끼우기
      if (value === 'After Due Date') {
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
      } else if (value === 'Manually') {
        const manualTime = manualReleaseTimes[rowIndex] ?? new Date()
        setSolutionReleaseTimes((prev) => ({
          ...prev,
          [rowIndex]: manualTime
        }))
        setProblems((prevProblems) =>
          prevProblems.map((problem, index) =>
            index === rowIndex
              ? {
                  ...problem,
                  solutionReleaseTime: manualTime
                }
              : problem
          )
        )
        setManualReleaseTimes((prev) => ({
          ...prev,
          [rowIndex]: manualTime
        }))
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

      if (date) {
        setManualReleaseTimes((prev) => ({
          ...prev,
          [rowIndex]: date
        }))
      }
      return newState
    })
  }

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      return (
        problem.solution?.some((solution) => solution.code.length > 0) ?? false
      )
    })
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
