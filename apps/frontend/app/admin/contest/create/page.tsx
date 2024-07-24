'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CREATE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST
} from '@/graphql/contest/mutations'
import {
  UPDATE_PROBLEM_VISIBLE,
  UPDATE_CONTEST_PROBLEMS_ORDER
} from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateContestInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { toast } from 'sonner'
import DescriptionForm from '../../_components/DescriptionForm'
import FormSection from '../../_components/FormSection'
import SwitchField from '../../_components/SwitchField'
import TitleForm from '../../_components/TitleForm'
import ContestProblemListLabel from '../_components/ContestProblemListLabel'
import ImportProblemButton from '../_components/ImportProblemButton'
import TimeForm from '../_components/TimeForm'
import { type ContestProblem, createSchema } from '../utils'
import { columns } from './_components/Columns'

export default function Page() {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [showInvitationCode, setShowInvitationCode] = useState<boolean>(false)

  const router = useRouter()

  const methods = useForm<CreateContestInput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      isRankVisible: true,
      isVisible: true
    }
  })

  const { handleSubmit, getValues, setValue } = methods

  const [createContest, { error }] = useMutation(CREATE_CONTEST)
  const [importProblemsToContest] = useMutation(IMPORT_PROBLEMS_TO_CONTEST)
  const [updateVisible] = useMutation(UPDATE_PROBLEM_VISIBLE)
  const [updateContestProblemsOrder] = useMutation(
    UPDATE_CONTEST_PROBLEMS_ORDER
  )

  const onSubmit = async (input: CreateContestInput) => {
    if (input.startTime >= input.endTime) {
      toast.error('Start time must be less than end time')
      return
    }
    const problemIds = problems.map((problem) => problem.id)
    const storedData = localStorage.getItem('orderArray')
    if (!storedData) {
      toast.error('Problem order not set')
      return
    }
    const orderArray = JSON.parse(storedData)
    if (orderArray.length !== problemIds.length) {
      toast.error('Problem order not set')
      return
    }
    orderArray.forEach((order: number) => {
      if (order === null) {
        toast.error('Problem order not set')
        return
      }
    })
    if (new Set(orderArray).size !== orderArray.length) {
      toast.error('Duplicate problem order found')
      return
    }

    setIsCreating(true)
    const { data } = await createContest({
      variables: {
        groupId: 1,
        input
      }
    })
    const contestId = Number(data?.createContest.id)
    if (error) {
      toast.error('Failed to create contest')
      setIsCreating(false)
      return
    }
    await importProblemsToContest({
      variables: {
        groupId: 1,
        contestId,
        problemIds
      }
    })

    const updateVisiblePromise = problems.map((problem) =>
      updateVisible({
        variables: {
          groupId: 1,
          input: {
            id: problem.id,
            isVisible: false
          }
        }
      })
    )
    await Promise.all(updateVisiblePromise)

    const orders: number[] = []
    orderArray.forEach((order: number, index: number) => {
      orders[order] = problemIds[index]
    })
    await updateContestProblemsOrder({
      variables: {
        groupId: 1,
        contestId,
        orders
      }
    })
    localStorage.removeItem('contestFormData')
    localStorage.removeItem('importProblems')
    localStorage.removeItem('orderArray')
    toast.success('Contest created successfully')
    router.push('/admin/contest')
    router.refresh()
  }

  useEffect(() => {
    const storedContestFormData = localStorage.getItem('contestFormData')
    if (storedContestFormData) {
      const contestFormData = JSON.parse(storedContestFormData)
      setValue('title', contestFormData.title)
      if (contestFormData.startTime) {
        setValue('startTime', new Date(contestFormData.startTime))
      }
      if (contestFormData.endTime) {
        setValue('endTime', new Date(contestFormData.endTime))
      }
      setValue('description', contestFormData.description)
      if (contestFormData.invitationCode) {
        setValue('invitationCode', contestFormData.invitationCode)
        setShowInvitationCode(true)
      }
    } else {
      setValue('description', ' ')
    }

    const importedProblems = JSON.parse(
      localStorage.getItem('importProblems') || '[]'
    )
    setProblems(importedProblems)

    // eslint-disable-next-line
    const orderArray = importedProblems.map((_: any, index: number) => index)
    localStorage.setItem('orderArray', JSON.stringify(orderArray))

    setIsLoading(false)
  }, [setValue])

  return (
    <ScrollArea className="w-full">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <Link href="/admin/contest">
            <FaAngleLeft className="h-12" />
          </Link>
          <span className="text-4xl font-bold">Create Contest</span>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-[760px] flex-col gap-6"
        >
          <FormProvider {...methods}>
            <FormSection title="Title">
              <TitleForm placeholder="Name your contest" />
            </FormSection>
            <div className="flex gap-6">
              <FormSection title="Start Time">
                <TimeForm name="startTime" />
              </FormSection>
              <FormSection title="End Time">
                <TimeForm name="endTime" />
              </FormSection>
            </div>
            <FormSection title="Description">
              {getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>
            {getValues('invitationCode') && (
              <SwitchField
                name="invitationCode"
                title="Invitation Code"
                type="number"
                isInput={true}
                placeholder="Enter a invitation code"
                hasValue={showInvitationCode}
              />
            )}

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <ContestProblemListLabel />
                <ImportProblemButton disabled={isLoading} isCreatePage={true} />
              </div>
              <DataTableAdmin
                // eslint-disable-next-line
                columns={columns as any[]}
                data={problems as ContestProblem[]}
                enableDelete={true}
                enableSearch={true}
              />
            </div>
            <Button
              type="submit"
              className="flex h-[36px] w-[100px] items-center gap-2 px-0"
              disabled={isLoading || isCreating}
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Create</div>
            </Button>
          </FormProvider>
        </form>
      </main>
    </ScrollArea>
  )
}
