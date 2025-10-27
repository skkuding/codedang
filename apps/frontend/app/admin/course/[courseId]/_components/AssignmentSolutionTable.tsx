import { DataTable, DataTableRoot } from '@/app/admin/_components/table'
import dayjs from 'dayjs'
import {
  useCallback,
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
    [problemId: number]: boolean
  }>({})
  const [optionStates, setOptionStates] = useState<{
    [problemId: number]: string
  }>({})
  const [solutionReleaseTimes, setSolutionReleaseTimes] = useState<{
    [problemId: number]: Date | null
  }>({})
  const [manualReleaseTimes, setManualReleaseTimes] = useState<{
    [problemId: number]: Date | null
  }>({})

  const hasProblemsLoaded = useRef(false)

  useEffect(() => {
    if (!hasProblemsLoaded.current && problems.length > 0) {
      const newRevealedStates: { [problemId: number]: boolean } = {}
      const newOptionStates: { [problemId: number]: string } = {}
      const newSolutionReleaseTimes: { [problemId: number]: Date | null } = {}
      const newManualReleaseTimes: { [problemId: number]: Date | null } = {}

      problems.forEach((problem) => {
        if (
          problem.solutionReleaseTime !== null &&
          problem.solutionReleaseTime !== undefined
        ) {
          newRevealedStates[problem.id] = true
        }

        if (problem.solutionReleaseTime === null) {
          newOptionStates[problem.id] = ''
        } else if (
          dayjs(problem.solutionReleaseTime).toString() ===
          dayjs(dueTime)?.toString()
        ) {
          newOptionStates[problem.id] = 'After Due Date'
        } else {
          newOptionStates[problem.id] = 'Manually'
          const releaseTime = new Date(problem.solutionReleaseTime)
          newSolutionReleaseTimes[problem.id] = releaseTime
          newManualReleaseTimes[problem.id] = releaseTime
        }
      })

      setRevealedStates(newRevealedStates)
      setOptionStates(newOptionStates)
      setSolutionReleaseTimes(newSolutionReleaseTimes)
      setManualReleaseTimes(newManualReleaseTimes)

      hasProblemsLoaded.current = true
    }
  }, [problems, dueTime])

  const handleSwitchChange = useCallback(
    (problemId: number) => {
      const newState = !revealedStates[problemId]
      const prevOption = optionStates[problemId]
      const prevManualTime = manualReleaseTimes[problemId]
      if (newState) {
        if (!prevOption || prevOption === '') {
          const dummyReleaseTime = new Date('2025-01-01')
          setOptionStates((prev) => ({
            ...prev,
            [problemId]: 'After Due Date'
          }))
          setProblems((prevProblems) =>
            prevProblems.map((problem) =>
              problem.id === problemId
                ? {
                    ...problem,
                    solutionReleaseTime: dummyReleaseTime
                  }
                : problem
            )
          )
          setSolutionReleaseTimes((prev) => ({
            ...prev,
            [problemId]: dummyReleaseTime
          }))
        } else if (prevOption === 'Manually' && prevManualTime) {
          setProblems((prevProblems) =>
            prevProblems.map((problem) =>
              problem.id === problemId
                ? {
                    ...problem,
                    solutionReleaseTime: prevManualTime
                  }
                : problem
            )
          )
          setSolutionReleaseTimes((prev) => ({
            ...prev,
            [problemId]: prevManualTime
          }))
          setOptionStates((prev) => ({
            ...prev,
            [problemId]: 'Manually'
          }))
        } else if (prevOption === 'After Due Date') {
          const dummyReleaseTime = new Date('2025-01-01')
          setOptionStates((prev) => ({
            ...prev,
            [problemId]: 'After Due Date'
          }))
          setProblems((prevProblems) =>
            prevProblems.map((problem) =>
              problem.id === problemId
                ? {
                    ...problem,
                    solutionReleaseTime: dummyReleaseTime
                  }
                : problem
            )
          )
          setSolutionReleaseTimes((prev) => ({
            ...prev,
            [problemId]: dummyReleaseTime
          }))
        }
      } else {
        setProblems((prevProblems) =>
          prevProblems.map((problem) =>
            problem.id === problemId
              ? {
                  ...problem,
                  solutionReleaseTime: null
                }
              : problem
          )
        )
        setSolutionReleaseTimes((prev) => ({
          ...prev,
          [problemId]: null
        }))
      }
      setRevealedStates((prev) => ({
        ...prev,
        [problemId]: newState
      }))
      console.log(solutionReleaseTimes)
    },
    [
      revealedStates,
      optionStates,
      manualReleaseTimes,
      setProblems,
      setSolutionReleaseTimes,
      setOptionStates,
      setRevealedStates,
      solutionReleaseTimes
    ]
  )

  const handleOptionChange = useCallback(
    (problemId: number, value: string) => {
      setOptionStates((prev) => {
        const newState = { ...prev, [problemId]: value }
        const dummyReleaseTime = new Date('2025-01-01')

        // 일단 2025-01-01로 해두고 Create 할 때 dueTime으로 갈아끼우기
        if (value === 'After Due Date') {
          setSolutionReleaseTimes((prev) => ({
            ...prev,
            [problemId]: new Date('2025-01-01')
          }))
          setProblems((prevProblems) =>
            prevProblems.map((problem) =>
              problem.id === problemId
                ? {
                    ...problem,
                    solutionReleaseTime: dummyReleaseTime
                  }
                : problem
            )
          )
        } else if (value === 'Manually') {
          const manualTime = manualReleaseTimes[problemId] ?? new Date()
          setSolutionReleaseTimes((prev) => ({
            ...prev,
            [problemId]: manualTime
          }))
          setProblems((prevProblems) =>
            prevProblems.map((problem) =>
              problem.id === problemId
                ? {
                    ...problem,
                    solutionReleaseTime: manualTime
                  }
                : problem
            )
          )
          setManualReleaseTimes((prev) => ({
            ...prev,
            [problemId]: manualTime
          }))
        }
        return newState
      })
    },
    [
      manualReleaseTimes,
      setManualReleaseTimes,
      setOptionStates,
      setProblems,
      setSolutionReleaseTimes
    ]
  )

  const handleTimeFormChange = useCallback(
    (problemId: number, date: Date | null) => {
      setSolutionReleaseTimes((prev) => {
        const newState = { ...prev, [problemId]: date }
        setProblems((prevProblems) =>
          prevProblems.map((problem) =>
            problem.id === problemId
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
            [problemId]: date
          }))
        }
        return newState
      })
    },
    [setSolutionReleaseTimes, setProblems, setManualReleaseTimes]
  )

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
    [
      revealedStates,
      handleSwitchChange,
      optionStates,
      handleOptionChange,
      handleTimeFormChange,
      solutionReleaseTimes
    ]
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
