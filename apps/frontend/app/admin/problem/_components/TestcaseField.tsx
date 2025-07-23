'use client'

import { CautionDialog } from '@/app/admin/_components/CautionDialog'
import { Paginator } from '@/components/Paginator'
import { Badge } from '@/components/shadcn/badge'
import { Button } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { cn } from '@/libs/utils'
import type { Testcase } from '@generated/graphql'
import { watch } from 'fs'
import { useEffect, useState, useMemo } from 'react'
import { type FieldErrorsImpl, useFormContext, useWatch } from 'react-hook-form'
import { FaArrowRotateLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { Label } from '../../_components/Label'
import { isInvalid } from '../_libs/utils'
// import { AddBadge } from './AddBadge'
import { TestcaseItem } from './TestcaseItem'

export function TestcaseField({ blockEdit = false }: { blockEdit?: boolean }) {
  const {
    formState: { errors },
    getValues,
    setValue,
    control
  } = useFormContext()

  const watchedItems: Testcase[] = useWatch({ name: 'testcases', control })

  const itemErrors = errors.testcases as FieldErrorsImpl

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false)
  const [dialogDescription, setDialogDescription] = useState<string>('')
  const [disableDistribution, setDisableDistribution] = useState<boolean>(false)
  const [isScoreNull, setIsScoreNull] = useState<boolean>(true)
  const [testcaseFlag, setTestcaseFlag] = useState<number>(0)

  useEffect(() => {
    const allFilled = watchedItems.every((item) => !isInvalid(item.scoreWeight))
    setDisableDistribution(allFilled)
    const allNull = watchedItems.every((item) => isInvalid(item.scoreWeight))
    setIsScoreNull(allNull)
  }, [watchedItems])

  const addTestcase = (isHidden: boolean) => {
    setValue('testcases', [
      ...getValues('testcases'),
      { input: '', output: '', isHidden, scoreWeight: '' }
    ])
  }

  const removeItem = (index: number) => {
    const currentValues: Testcase[] = getValues('testcases')
    if (currentValues.length <= 1) {
      setDialogDescription(
        'You cannot delete the testcase if it is the only one in the list. There must be at least one testcase in order to create this problem.'
      )
      setDialogOpen(true)
      return
    }
    const updatedValues = currentValues.filter((_, i) => i !== index)
    setValue('testcases', updatedValues)
  }

  const equalDistribution = () => {
    const currentValues: Testcase[] = getValues('testcases')

    const totalAssignedScore = currentValues
      .map((tc) => tc.scoreWeight)
      .filter((score) => !isInvalid(score))
      .reduce((acc: number, score) => {
        if (score < 0) {
          setDialogDescription(
            'The scoring ratios contain negative value(s).\nPlease review and correct them.'
          )
          setDialogOpen(true)
        }
        return acc + score
      }, 0)

    const remainingScore = 100 - totalAssignedScore

    if (remainingScore < 0) {
      setDialogDescription(
        'The scoring ratios have not been specified correctly.\nPlease review and correct them.'
      )
      setDialogOpen(true)
      return
    }

    const unassignedTestcases = currentValues
      .map((tc, index) => ({ ...tc, index }))
      .filter((tc) => isInvalid(tc.scoreWeight))
    const unassignedCount = unassignedTestcases.length

    if (unassignedCount === 0) {
      return
    }

    const baseScore = Math.floor(remainingScore / unassignedCount)
    const extraScore = remainingScore - baseScore * unassignedCount

    const lastUnassignedIndex = unassignedTestcases[unassignedCount - 1].index

    const updatedTestcases = currentValues.map((tc, index) => {
      if (isInvalid(tc.scoreWeight)) {
        const newScore =
          baseScore + (index === lastUnassignedIndex ? extraScore : 0)
        return { ...tc, scoreWeight: newScore }
      }
      return tc
    })

    setValue('testcases', updatedTestcases)
  }
  const initializeScore = () => {
    const currentValues: Testcase[] = getValues('testcases')
    const updatedTestcases = currentValues.map((tc) => {
      return { ...tc, scoreWeight: null }
    })
    setValue('testcases', updatedTestcases)
  }

  const PAGE_SIZE = 2
  const [currentPage, setCurrentPage] = useState(1)

  const [filteredItems, setFilteredItems] = useState<
    (Testcase & { originalIndex: number })[]
  >([])

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE)

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredItems, currentPage])

  const paginatorProps = {
    page: {
      current: currentPage,
      first: 1,
      count: totalPages,
      goto: setCurrentPage
    },
    slot: {
      prev: currentPage > 1 ? 'prev' : '',
      next: currentPage < totalPages ? 'next' : '',
      goto: (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentPage > 1) {
          setCurrentPage((p) => p - 1)
        } else if (direction === 'next' && currentPage < totalPages) {
          setCurrentPage((p) => p + 1)
        }
      }
    }
  }

  const totalScore = filteredItems.reduce((acc, tc) => {
    const weight = Number(tc.scoreWeight)
    return acc + (isNaN(weight) ? 0 : weight)
  }, 0)

  useEffect(() => {
    const newItems = watchedItems
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter((item) => (testcaseFlag === 0 ? !item.isHidden : item.isHidden))

    setFilteredItems(newItems)
  }, [watchedItems, testcaseFlag])

  // useEffect(() => {
  //   console.log('watchedItems:', watchedItems)
  //   console.log('filteredItems:', filteredItems)
  //   console.log('currentItems:', currentItems)
  // }, [watchedItems, filteredItems, currentItems])

  return (
    <div className="flex h-full w-full flex-col border-[1px] border-[#D8D8D8] bg-white px-10 pb-10 pt-[10px]">
      <div className="mb-[50px] flex w-full items-center justify-between">
        <button
          className={`flex w-full justify-center bg-white p-[18px] text-lg font-normal text-[#333333] opacity-90 hover:text-gray-700 ${testcaseFlag === 1 ? 'border-b-[4px] border-b-white' : 'border-b-primary border-b-[4px] font-semibold text-[#3581FA] hover:text-[#3581FA]'}`}
          onClick={() => setTestcaseFlag(0)}
        >
          SAMPLE
        </button>
        <button
          className={`flex w-full justify-center bg-white p-[18px] text-lg font-normal text-[#333333] opacity-90 hover:text-gray-700 ${testcaseFlag === 0 ? 'border-b-[4px] border-b-white' : 'border-b-primary border-b-[4px] font-semibold text-[#3581FA] hover:text-[#3581FA]'}`}
          onClick={() => setTestcaseFlag(1)}
        >
          HIDDEN
        </button>
      </div>
      {testcaseFlag === 0 && (
        <div className="flex flex-col gap-4">
          <Label required={false}>Sample Testcase</Label>
          <div className="flex min-h-[400px] flex-col gap-4">
            {currentItems.map((item, index) => {
              return (
                !item.isHidden && (
                  <TestcaseItem
                    blockEdit={blockEdit}
                    key={item.originalIndex}
                    index={item.originalIndex}
                    currentIndex={(currentPage - 1) * PAGE_SIZE + index}
                    itemError={itemErrors}
                    onRemove={() => removeItem(item.originalIndex)}
                  />
                )
              )
            })}
          </div>
          {totalPages > 1 && <Paginator {...paginatorProps} />}
          {!blockEdit && (
            <Badge
              onClick={() => addTestcase(false)}
              className="h-[38px] w-full cursor-pointer items-center justify-center border border-gray-200 bg-gray-200/60 p-0 text-[#8A8A8A] shadow-sm hover:bg-gray-200"
            >
              <div className="flex items-center">
                <span className="mr-1 flex h-6 w-full items-center justify-center pb-[2px] text-2xl font-thin">
                  +
                </span>
                <span className="flex h-6 w-full items-center text-base font-medium">
                  {' '}
                  Add
                </span>
              </div>
            </Badge>
          )}
        </div>
      )}
      {testcaseFlag === 1 && (
        <div className="flex flex-col gap-4">
          <Label required={false}>Hidden Testcase</Label>
          <div className="flex min-h-[400px] flex-col gap-4">
            {currentItems.map((item, index) => {
              return (
                item.isHidden && (
                  <TestcaseItem
                    blockEdit={blockEdit}
                    key={item.originalIndex}
                    index={item.originalIndex}
                    currentIndex={(currentPage - 1) * PAGE_SIZE + index}
                    itemError={itemErrors}
                    onRemove={() => removeItem(item.originalIndex)}
                  />
                )
              )
            })}
          </div>
          {totalPages > 1 && <Paginator {...paginatorProps} />}
          {!blockEdit && (
            <Badge
              onClick={() => addTestcase(true)}
              className="h-[38px] w-full cursor-pointer items-center justify-center border border-gray-200 bg-gray-200/60 p-0 text-[#8A8A8A] shadow-sm hover:bg-gray-200"
            >
              <div className="flex items-center">
                <span className="mr-1 flex h-6 w-full items-center justify-center pb-[2px] text-2xl font-thin">
                  +
                </span>
                <span className="flex h-6 w-full items-center text-base font-medium">
                  {' '}
                  Add
                </span>
              </div>
            </Badge>
          )}
        </div>
      )}
      <div className="mt-10 flex w-full justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  'w-43 flex h-10 items-center gap-2 px-3 py-2',
                  isScoreNull &&
                    'bg-#FFFFFF border border-[1px] border-[#D8D8D8] text-[#B0B0B0]'
                )}
                onClick={initializeScore}
                disabled={isScoreNull}
              >
                <FaArrowRotateLeft
                  fontSize={20}
                  className={cn(isScoreNull && 'text-[#C4C4C4]')}
                />
                <p>Reset Ratio</p>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-black shadow-sm">
              Click to discard all of the scores of testcases.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center">
          <span className="text-base font-medium text-[#474747]">Total of</span>
          <span className="ml-1 mr-5 font-medium text-[#3581FA]">
            {filteredItems.length}
          </span>
          <div className="hide-spin-button mr-1 flex h-7 w-20 items-center justify-center rounded-[1000px] border border-[1px] border-[#D8D8D8] bg-[#F5F5F5] px-2 py-1 text-center text-base font-medium text-[#000000]">
            {totalScore}
          </div>
          <span className="text-sm font-semibold text-[#737373]">(%)</span>
        </div>
      </div>
      <div className="mt-5 flex w-full justify-end gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  'flex h-9 w-full items-center gap-2 px-0',
                  disableDistribution && 'bg-gray-300 text-gray-600'
                )}
                type="button"
                onClick={equalDistribution}
                disabled={disableDistribution}
              >
                <IoIosCheckmarkCircle
                  fontSize={20}
                  className={cn(disableDistribution && 'text-gray-600')}
                />
                <p>Equal Distribution</p>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-black shadow-sm">
              Click to equally distribute the scoring ratio for testcases where
              the percentage is not specified.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <CautionDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        description={dialogDescription}
      />
    </div>
  )
}
