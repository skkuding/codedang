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
  const [searchTC, setsearchTC] = useState('')
  const [selectedTestcases, setSelectedTestcases] = useState<number[]>([])
  const [dataChangeTrigger, setDataChangeTrigger] = useState<number>(0)

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
  const handleSelectTestcase = (index: number, isSelected: boolean) => {
    setSelectedTestcases((prev) =>
      isSelected ? [...prev, index] : prev.filter((i) => i !== index)
    )
  }

  const deleteSelectedTestcases = () => {
    const currentValues: Testcase[] = getValues('testcases')
    if (currentValues.length <= selectedTestcases.length) {
      setDialogDescription('At least one test case must be retained.')
      setDialogOpen(true)
      return
    }
    const updatedValues = currentValues.filter(
      (_, i) => !selectedTestcases.includes(i)
    )
    setValue('testcases', updatedValues)
    setSelectedTestcases([])
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

  const PAGE_SIZE = 5
  const [currentPage, setCurrentPage] = useState(1)

  const [filteredItems, setFilteredItems] = useState<
    (Testcase & { originalIndex: number })[]
  >([])

  const filteredTC = useMemo(() => {
    const itemsWithOriginalIndex = watchedItems
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter((item) => (testcaseFlag === 0 ? !item.isHidden : item.isHidden))

    const itemsWithCurrentIndex = itemsWithOriginalIndex.map((item, index) => ({
      ...item,
      currentIndex: index
    }))

    const searched = itemsWithCurrentIndex.filter((item) => {
      const indexstr = `#${(item.currentIndex + 1).toString().padStart(2, '0')}`
      return indexstr.toLowerCase().includes(searchTC.toLowerCase())
    })

    return searched
  }, [watchedItems, testcaseFlag, searchTC])

  const totalPages = Math.ceil(filteredTC.length / PAGE_SIZE)

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredTC.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredTC, currentPage])

  const paginatorProps = {
    page: {
      current: currentPage,
      first: 1,
      count: totalPages,
      goto: (page: number) => {
        if (page >= 1 && page <= totalPages) {
          setDataChangeTrigger((prev) => prev + 1)
          setCurrentPage(page)
        }
      }
    },
    slot: {
      prev: currentPage > 1 ? 'prev' : '',
      next: currentPage < totalPages ? 'next' : '',
      goto: (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentPage > 1) {
          setDataChangeTrigger((prev) => prev + 1)
          setCurrentPage((p) => p - 1)
        } else if (direction === 'next' && currentPage < totalPages) {
          setDataChangeTrigger((prev) => prev + 1)
          setCurrentPage((p) => p + 1)
        }
      }
    }
  }

  const totalScore = filteredTC.reduce((acc, tc) => {
    const weight = Number(tc.scoreWeight)
    return acc + (isNaN(weight) ? 0 : weight)
  }, 0)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTC, testcaseFlag])

  useEffect(() => {
    const newItems = watchedItems
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter((item) => (testcaseFlag === 0 ? !item.isHidden : item.isHidden))

    setFilteredItems(newItems)
  }, [watchedItems, testcaseFlag])

  useEffect(() => {
    if (currentItems.length === 0 && currentPage > 1 && dataChangeTrigger > 0) {
      setCurrentPage((p) => p - 1)
    }
  }, [currentItems])

  return (
    <div className="flex h-full w-full flex-col border-[1px] border-[#D8D8D8] bg-white px-10 pb-10 pt-[20px]">
      <div className="mb-[40px] flex w-full items-center justify-between">
        <button
          className={`flex w-full justify-center bg-white p-[18px] text-lg font-normal text-[#333333] opacity-90 ${testcaseFlag === 1 ? 'border-b-[4px] border-b-white' : 'border-b-primary border-b-[4px] font-semibold text-[#3581FA] hover:text-[#3581FA]'}`}
          type="button"
          onClick={() => {
            setDataChangeTrigger(0)
            setTestcaseFlag(0)
          }}
        >
          SAMPLE
        </button>
        <button
          className={`flex w-full justify-center bg-white p-[18px] text-lg font-normal text-[#333333] opacity-90 ${testcaseFlag === 0 ? 'border-b-[4px] border-b-white' : 'border-b-primary border-b-[4px] font-semibold text-[#3581FA] hover:text-[#3581FA]'}`}
          type="button"
          onClick={() => {
            setDataChangeTrigger(0)
            setTestcaseFlag(1)
          }}
        >
          HIDDEN
        </button>
      </div>
      {testcaseFlag === 0 && (
        <div className="flex flex-col gap-10">
          <Label required={false} className="text-2xl font-semibold text-black">
            Sample Testcase
          </Label>
          <div className="flex w-full items-center justify-between">
            <div className="pr-25 flex w-[400px] items-center justify-start gap-2 rounded-[1000px] border border-[1px] border-[#D8D8D8] bg-white py-2 pl-3">
              <img
                src="/icons/search.svg"
                alt="Search Icon"
                className="h-4 w-4"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTC}
                onChange={(e) => {
                  setsearchTC(e.target.value)
                  setDataChangeTrigger((prev) => prev + 1)
                }}
                className="!focus:outline-none w-[300px] text-lg font-normal text-[#5C5C5C] !outline-none placeholder:text-[#C4C4C4]"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                className="flex cursor-pointer items-center justify-center rounded-[1000px] border border-[1px] border-[#C4C4C4] bg-[#F5F5F5] px-[24px] py-[10px]"
                type="button"
              >
                <img
                  src="/icons/upload.svg"
                  alt="upload Icon"
                  className="h-[20px] w-[20px]"
                />
                {/* 테스트케이스 업로드하는 함수 추가 해주시면 될 것 같아요 */}
              </button>
              <button
                onClick={() => {
                  deleteSelectedTestcases()
                  setDataChangeTrigger((prev) => prev + 1)
                }}
                type="button"
                className={cn(
                  'flex w-[109px] cursor-pointer items-center justify-center rounded-[1000px] px-[22px] py-[10px]',
                  selectedTestcases.length > 0
                    ? 'bg-[#FC5555] text-white'
                    : 'bg-gray-300 text-gray-600'
                )}
                disabled={selectedTestcases.length === 0}
              >
                <img
                  src="/icons/trashcan.svg"
                  alt="trashcan Icon"
                  className="h-[18px] w-[18px]"
                />
                <span className="ml-[6px] flex items-center text-center text-white">
                  Delete
                </span>
              </button>

              {!blockEdit && (
                <button
                  onClick={() => {
                    addTestcase(false)
                    setDataChangeTrigger((prev) => prev + 1)
                  }}
                  type="button"
                  className="flex w-[109px] cursor-pointer items-center justify-center rounded-[1000px] bg-[#3581FA] px-[22px] py-[10px]"
                >
                  <img
                    src="/icons/plus-circle-white.svg"
                    alt="plus circle white Icon"
                    className="h-[18px] w-[18px]"
                  />
                  <span className="ml-[6px] flex items-center text-center text-white">
                    Add
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="flex min-h-[400px] flex-col gap-4">
            {currentItems.map((item, index) => {
              return (
                !item.isHidden && (
                  <TestcaseItem
                    blockEdit={blockEdit}
                    key={item.originalIndex}
                    index={item.originalIndex}
                    currentIndex={item.currentIndex}
                    itemError={itemErrors}
                    onRemove={() => removeItem(item.originalIndex)}
                    onSelect={(isSelected: boolean) =>
                      handleSelectTestcase(item.originalIndex, isSelected)
                    }
                    isSelected={selectedTestcases.includes(item.originalIndex)}
                  />
                )
              )
            })}
          </div>
          {totalPages > 1 && <Paginator {...paginatorProps} />}
        </div>
      )}
      {testcaseFlag === 1 && (
        <div className="flex flex-col gap-10">
          <Label required={false} className="text-2xl font-semibold text-black">
            Hidden Testcase
          </Label>
          <div className="flex w-full items-center justify-between">
            <div className="pr-25 flex w-[400px] items-center justify-start gap-2 rounded-[1000px] border border-[1px] border-[#D8D8D8] bg-white py-2 pl-3">
              <img
                src="/icons/search.svg"
                alt="Search Icon"
                className="h-4 w-4"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTC}
                onChange={(e) => {
                  setsearchTC(e.target.value)
                  setDataChangeTrigger((prev) => prev + 1)
                }}
                className="!focus:outline-none w-[300px] text-lg font-normal text-[#5C5C5C] !outline-none placeholder:text-[#C4C4C4]"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                className="flex cursor-pointer items-center justify-center rounded-[1000px] border border-[1px] border-[#C4C4C4] bg-[#F5F5F5] px-[24px] py-[10px]"
                type="button"
              >
                <img
                  src="/icons/upload.svg"
                  alt="upload Icon"
                  className="h-[20px] w-[20px]"
                />
              </button>
              <button
                onClick={() => {
                  deleteSelectedTestcases()
                  setDataChangeTrigger((prev) => prev + 1)
                }}
                type="button"
                className={cn(
                  'flex w-[109px] cursor-pointer items-center justify-center rounded-[1000px] px-[22px] py-[10px]',
                  selectedTestcases.length > 0
                    ? 'bg-[#FC5555] text-white'
                    : 'bg-gray-300 text-gray-600'
                )}
                disabled={selectedTestcases.length === 0}
              >
                <img
                  src="/icons/trashcan.svg"
                  alt="trashcan Icon"
                  className="h-[18px] w-[18px]"
                />
                <span className="ml-[6px] flex items-center text-center text-white">
                  Delete
                </span>
              </button>

              {!blockEdit && (
                <button
                  onClick={() => {
                    addTestcase(true)
                    setDataChangeTrigger((prev) => prev + 1)
                  }}
                  type="button"
                  className="flex w-[109px] cursor-pointer items-center justify-center rounded-[1000px] bg-[#3581FA] px-[22px] py-[10px]"
                >
                  <img
                    src="/icons/plus-circle-white.svg"
                    alt="plus circle white Icon"
                    className="h-[18px] w-[18px]"
                  />
                  <span className="ml-[6px] flex items-center text-center text-white">
                    Add
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="flex min-h-[400px] flex-col gap-4">
            {currentItems.map((item, index) => {
              return (
                item.isHidden && (
                  <TestcaseItem
                    blockEdit={blockEdit}
                    key={item.originalIndex}
                    index={item.originalIndex}
                    currentIndex={item.currentIndex}
                    itemError={itemErrors}
                    onRemove={() => removeItem(item.originalIndex)}
                    onSelect={(isSelected: boolean) =>
                      handleSelectTestcase(item.originalIndex, isSelected)
                    }
                    isSelected={selectedTestcases.includes(item.originalIndex)}
                  />
                )
              )
            })}
          </div>
          {totalPages > 1 && <Paginator {...paginatorProps} />}
        </div>
      )}
      <div className="mt-10 flex w-full justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  'flex h-10 w-[133px] items-center gap-2 px-3 py-2',
                  isScoreNull &&
                    'bg-#FFFFFF border border-[1px] border-[#D8D8D8] text-[#9B9B9B] !opacity-100'
                )}
                onClick={() => {
                  initializeScore()
                  setDataChangeTrigger((prev) => prev + 1)
                }}
                disabled={isScoreNull}
              >
                <FaArrowRotateLeft
                  fontSize={20}
                  className={cn(isScoreNull && 'text-[#B0B0B0]')}
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
                  'flex h-[42px] w-full items-center gap-2 px-0',
                  disableDistribution && 'bg-gray-300 text-gray-600'
                )}
                type="button"
                onClick={() => {
                  equalDistribution()
                  setDataChangeTrigger((prev) => prev + 1)
                }}
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
