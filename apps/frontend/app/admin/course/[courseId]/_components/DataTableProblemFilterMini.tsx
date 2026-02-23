import { SUBMISSION_PROBLEM_COLUMN_ID } from '@/app/admin/_components/table/constants'
import { useDataTable } from '@/app/admin/_components/table/context'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  GET_ASSIGNMENT_PROBLEMS,
  GET_CONTEST_PROBLEMS
} from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { IoChevronDown, IoFilter } from 'react-icons/io5'

export function DataTableProblemFilterMini({
  contestId = 0,
  groupId = 0,
  assignmentId = 0
}: {
  contestId?: number
  groupId?: number
  assignmentId?: number
}) {
  const { t } = useTranslate()
  const { table } = useDataTable()
  const column = table.getColumn(SUBMISSION_PROBLEM_COLUMN_ID)
  const selectedValues = (column?.getFilterValue() as string[]) || []

  const [options, setOptions] = useState<
    { value: string; label: string; orderOnly: string; order: number }[]
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
    setOptions(
      sortedProblems.map((problem) => ({
        value: problem.problem.title,
        label: `${String.fromCharCode(65 + problem.order)}. ${problem.problem.title}`,
        orderOnly: String.fromCharCode(65 + problem.order),
        order: problem.order
      }))
    )
  }, [contestId, contestProblems, assignmentProblems])

  // 드롭다운 상태 및 임시 선택값
  const [open, setOpen] = useState(false)
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues)

  // 드롭다운 열릴 때마다 임시 선택값 동기화
  useEffect(() => {
    if (open) {
      setTempSelected(selectedValues)
    }
  }, [open])

  // All Problems 토글
  const handleAllToggle = () => {
    if (tempSelected.length === options.length) {
      setTempSelected([])
    } else {
      setTempSelected(options.map(({ value }) => value))
    }
  }

  // 개별 문제 토글
  const handleToggle = (value: string) => {
    setTempSelected(
      tempSelected.includes(value)
        ? tempSelected.filter((v) => v !== value)
        : [...tempSelected, value]
    )
  }

  // Apply 시 실제 필터 적용
  const handleApply = () => {
    column?.setFilterValue(tempSelected)
    setOpen(false)
  }

  // 드롭다운 버튼에 표시될 텍스트
  const getSelectedLabel = () => {
    if (
      selectedValues.length === 0 ||
      selectedValues.length === options.length
    ) {
      return t('all_label')
    }
    // 선택된 문제들의 order 알파벳만 콤마로 표시
    const selectedOrders = selectedValues
      .map((value) => {
        const opt = options.find((o) => o.value === value)
        return opt ? opt.orderOnly : null
      })
      .filter(Boolean)
      .join(', ')
    return selectedOrders || t('all_label')
  }

  return (
    <div className="relative">
      <button
        className="shadow-2xs flex h-9 min-w-[180px] items-center gap-2 rounded-full border border-gray-300 bg-white px-4"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <IoFilter className="text-lg text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          {t('problem_label')}
        </span>
        <span className="ml-2 text-xs font-semibold text-gray-500">
          {getSelectedLabel()}
        </span>
        <IoChevronDown
          className={cn(
            'ml-auto text-base text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-2 flex w-60 flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
          <div
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-md px-1 py-1 transition-colors',
              tempSelected.length === options.length
                ? 'bg-blue-50'
                : 'hover:bg-gray-100'
            )}
            onClick={handleAllToggle}
          >
            <Checkbox
              checked={tempSelected.length === options.length}
              className="rounded-xs h-4 w-4 border-gray-300"
            />
            <span
              className={cn(
                'text-sm',
                tempSelected.length === options.length
                  ? 'text-primary font-bold'
                  : 'font-normal text-gray-800'
              )}
            >
              {t('all_problems_label')}
            </span>
          </div>
          {options.map((problem) => (
            <div
              key={problem.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md px-1 py-1 transition-colors',
                tempSelected.includes(problem.value)
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-100'
              )}
              onClick={() => handleToggle(problem.value)}
            >
              <Checkbox
                checked={tempSelected.includes(problem.value)}
                className="rounded-xs h-4 w-4 border-gray-300"
              />
              <span
                className={cn(
                  'text-sm',
                  tempSelected.includes(problem.value)
                    ? 'text-primary font-bold'
                    : 'font-normal text-gray-800'
                )}
              >
                {problem.label}
              </span>
            </div>
          ))}
          <button
            className="bg-primary mt-2 h-8 w-full rounded-full text-sm font-bold text-white shadow-none transition hover:bg-blue-600"
            onClick={handleApply}
          >
            {t('apply_button')}
          </button>
        </div>
      )}
    </div>
  )
}
