'use client'

import { Modal } from '@/components/Modal'
import { Paginator } from '@/components/Paginator'
import { Button } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { cn } from '@/libs/utils'
import type { Testcase } from '@generated/graphql'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { type FieldErrorsImpl, useFormContext, useWatch } from 'react-hook-form'
import { FaArrowRotateLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { Label } from '../../_components/Label'
import { isInvalid } from '../_libs/utils'
import { TestcaseItem } from './TestcaseItem'
import { TestcaseUploadModal } from './TestcaseUploadModal'

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
    const isScoreAssigned = (tc: Testcase) =>
      typeof tc.scoreWeight === 'number' ||
      (typeof tc.scoreWeightNumerator === 'number' &&
        typeof tc.scoreWeightDenominator === 'number')

    const allFilled = watchedItems.every(isScoreAssigned)
    setDisableDistribution(allFilled)

    const allNull = watchedItems.every((tc) => !isScoreAssigned(tc))
    setIsScoreNull(allNull)
  }, [watchedItems])

  const addTestcase = (isHidden: boolean) => {
    setValue('testcases', [
      ...getValues('testcases'),
      { input: '', output: '', isHidden, scoreWeight: undefined }
    ])
  }

  const handleUploadTestcases = (
    uploadedTestcases: Array<{ input: string; output: string }>
  ) => {
    const currentTestcases = getValues('testcases')
    const isHidden = testcaseFlag === 1

    const newTestcases = uploadedTestcases.map((testcase) => ({
      input: testcase.input,
      output: testcase.output,
      isHidden,
      scoreWeight: undefined
    }))

    setValue('testcases', [...currentTestcases, ...newTestcases])
    setDataChangeTrigger((prev) => prev + 1)
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

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }

  const equalDistribution = () => {
    const currentValues: Testcase[] = getValues('testcases')

    const totalAssignedScore = currentValues
      .map((tc) => tc.scoreWeight ?? 0)
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

    const numerator = remainingScore
    const denominator = 100 * unassignedCount

    const commonDivisor = gcd(numerator, denominator)

    const finalNumerator = numerator / commonDivisor
    const finalDenominator = denominator / commonDivisor

    const updatedTestcases = currentValues.map((tc) => {
      if (isInvalid(tc.scoreWeight)) {
        return {
          ...tc,
          scoreWeight: undefined,
          scoreWeightNumerator: finalNumerator,
          scoreWeightDenominator: finalDenominator
        }
      }
      return tc
    })

    setValue('testcases', updatedTestcases)
  }

  const initializeScore = () => {
    const currentValues: Testcase[] = getValues('testcases')
    const updatedTestcases = currentValues.map((tc) => {
      return {
        ...tc,
        scoreWeight: undefined,
        scoreWeightNumerator: null,
        scoreWeightDenominator: null
      }
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

  const currentGroup = Math.floor((currentPage - 1) / 10)
  const groupStartPage = currentGroup * 10 + 1
  const groupEndPage = Math.min(groupStartPage + 9, totalPages)
  const totalGroups = Math.ceil(totalPages / 10)

  const paginatorProps = {
    page: {
      current: currentPage,
      first: groupStartPage,
      count: groupEndPage - groupStartPage + 1,
      goto: (page: number) => {
        if (page >= groupStartPage && page <= groupEndPage) {
          setDataChangeTrigger((prev) => prev + 1)
          setCurrentPage(page)
        }
      }
    },
    slot: {
      prev: currentGroup > 0 ? 'prev' : '',
      next: currentGroup < totalGroups - 1 ? 'next' : '',
      goto: (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentGroup > 0) {
          const targetPage = currentGroup * 10
          setDataChangeTrigger((prev) => prev + 1)
          setCurrentPage(targetPage)
        } else if (direction === 'next' && currentGroup < totalGroups - 1) {
          const targetPage = (currentGroup + 1) * 10 + 1
          setDataChangeTrigger((prev) => prev + 1)
          setCurrentPage(targetPage)
        }
      }
    }
  }

  const totalScore = useMemo(() => {
    const score = watchedItems.reduce((acc, tc) => {
      if (typeof tc.scoreWeight === 'number') {
        return acc + tc.scoreWeight
      }
      if (tc.scoreWeightNumerator && tc.scoreWeightDenominator) {
        const percentage =
          (tc.scoreWeightNumerator / tc.scoreWeightDenominator) * 100
        return acc + percentage
      }
      return acc
    }, 0)

    return score.toFixed(2)
  }, [watchedItems])

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
    <div className="flex h-full w-full flex-col border border-[#D8D8D8] bg-white px-10 pb-10 pt-[20px]">
      <div className="mb-[40px] flex w-full items-center justify-between">
        <button
          className={`flex w-full justify-center bg-white p-[18px] text-lg font-normal text-[#333333] opacity-90 ${testcaseFlag === 1 ? 'border-b-4 border-b-white' : 'border-b-primary border-b-4 font-semibold text-[#3581FA] hover:text-[#3581FA]'}`}
          type="button"
          onClick={() => {
            setDataChangeTrigger(0)
            setTestcaseFlag(0)
          }}
        >
          SAMPLE
        </button>
        <button
          className={`flex w-full justify-center bg-white p-[18px] text-lg font-normal text-[#333333] opacity-90 ${testcaseFlag === 0 ? 'border-b-4 border-b-white' : 'border-b-primary border-b-4 font-semibold text-[#3581FA] hover:text-[#3581FA]'}`}
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
            <div className="pr-25 flex w-[400px] items-center justify-start gap-2 rounded-[1000px] border border-[#D8D8D8] bg-white py-2 pl-3">
              <Image
                src="/icons/search.svg"
                alt="Search Icon"
                width={16}
                height={16}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTC}
                onChange={(e) => {
                  setsearchTC(e.target.value)
                  setDataChangeTrigger((prev) => prev + 1)
                }}
                className="!focus:outline-none outline-hidden! w-[300px] text-lg font-normal text-[#5C5C5C] placeholder:text-[#C4C4C4]"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <TestcaseUploadModal
                onUpload={handleUploadTestcases}
                isHidden={false}
              />
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
                <Image
                  src="/icons/trashcan.svg"
                  alt="trashcan Icon"
                  width={18}
                  height={18}
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
                  <Image
                    src="/icons/plus-circle-white.svg"
                    alt="plus circle white Icon"
                    width={18}
                    height={18}
                  />
                  <span className="ml-[6px] flex items-center text-center text-white">
                    Add
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="flex min-h-[400px] flex-col gap-4">
            {currentItems.map((item) => {
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
            <div className="pr-25 flex w-[400px] items-center justify-start gap-2 rounded-[1000px] border border-[#D8D8D8] bg-white py-2 pl-3">
              <Image
                src="/icons/search.svg"
                alt="Search Icon"
                width={16}
                height={16}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchTC}
                onChange={(e) => {
                  setsearchTC(e.target.value)
                  setDataChangeTrigger((prev) => prev + 1)
                }}
                className="!focus:outline-none outline-hidden! w-[300px] text-lg font-normal text-[#5C5C5C] placeholder:text-[#C4C4C4]"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <TestcaseUploadModal
                onUpload={handleUploadTestcases}
                isHidden={true}
              />
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
                <Image
                  src="/icons/trashcan.svg"
                  alt="trashcan Icon"
                  width={18}
                  height={18}
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
                  <Image
                    src="/icons/plus-circle-white.svg"
                    alt="plus circle white Icon"
                    width={18}
                    height={18}
                  />
                  <span className="ml-[6px] flex items-center text-center text-white">
                    Add
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="flex min-h-[400px] flex-col gap-4">
            {currentItems.map((item) => {
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
                    'bg-#FFFFFF opacity-100! border border-[#D8D8D8] text-[#9B9B9B]'
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
            <TooltipContent className="shadow-2xs bg-white text-black">
              Click to discard all of the scores of testcases.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center">
          <span className="text-base font-medium text-[#474747]">Total of</span>
          <span className="ml-1 mr-5 font-medium text-[#3581FA]">
            {filteredItems.length}
          </span>
          <div className="hide-spin-button mr-1 flex h-7 w-20 items-center justify-center rounded-[1000px] border border-[#D8D8D8] bg-[#F5F5F5] px-2 py-1 text-center text-base font-medium text-[#000000]">
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
            <TooltipContent className="shadow-2xs bg-white text-black">
              Click to equally distribute the scoring ratio for testcases where
              the percentage is not specified.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Modal
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        title="Warning"
        size="sm"
        headerDescription={dialogDescription}
        onClose={() => setDialogOpen(false)}
        type="warning"
      />
    </div>
  )
}
