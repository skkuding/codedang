'use client'

import { CautionDialog } from '@/app/admin/_components/CautionDialog'
import { Button } from '@/components/shadcn/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { cn } from '@/libs/utils'
import type { Testcase } from '@generated/graphql'
import { useEffect, useState } from 'react'
import { type FieldErrorsImpl, useFormContext, useWatch } from 'react-hook-form'
import { FaArrowRotateLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { Label } from '../../_components/Label'
import { isInvalid } from '../_libs/utils'
import { AddBadge } from './AddBadge'
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

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Label required={false}>Sample Testcase</Label>
        {watchedItems.map(
          (item, index) =>
            !item.isHidden && (
              <TestcaseItem
                blockEdit={blockEdit}
                key={index}
                index={index}
                itemError={itemErrors}
                onRemove={() => removeItem(index)}
              />
            )
        )}
        {!blockEdit && <AddBadge onClick={() => addTestcase(false)} />}
      </div>
      <div className="flex flex-col gap-4">
        <Label required={false}>Hidden Testcase</Label>
        {watchedItems.map(
          (item, index) =>
            item.isHidden && (
              <TestcaseItem
                blockEdit={blockEdit}
                key={index}
                index={index}
                itemError={itemErrors}
                onRemove={() => removeItem(index)}
              />
            )
        )}
        {!blockEdit && <AddBadge onClick={() => addTestcase(true)} />}
      </div>
      <div className="flex w-full justify-end gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  'flex h-9 w-40 items-center gap-2 px-0',
                  isScoreNull && 'bg-gray-300 text-gray-600'
                )}
                onClick={initializeScore}
                disabled={isScoreNull}
              >
                <FaArrowRotateLeft
                  fontSize={20}
                  className={cn(isScoreNull && 'text-gray-600')}
                />
                <p>Reset Ratio</p>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-black shadow-sm">
              Click to discard all of the scores of testcases.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  'flex h-9 w-40 items-center gap-2 px-0',
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
