'use client'

import DescriptionForm from '@/app/admin/_components/DescriptionForm'
import FormSection from '@/app/admin/_components/FormSection'
import SwitchField from '@/app/admin/_components/SwitchField'
import TitleForm from '@/app/admin/_components/TitleForm'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  IMPORT_PROBLEMS_TO_CONTEST,
  UPDATE_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST
} from '@/graphql/contest/mutations'
import { GET_CONTEST } from '@/graphql/contest/queries'
import {
  UPDATE_PROBLEM_VISIBLE,
  UPDATE_CONTEST_PROBLEMS_ORDER
} from '@/graphql/problem/mutations'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateContestInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { toast } from 'sonner'
import ContestProblemListLabel from '../../_components/ContestProblemListLabel'
import ImportProblemButton from '../../_components/ImportProblemButton'
import TimeForm from '../../_components/TimeForm'
import { type ContestProblem, editSchema } from '../../utils'
import { columns } from '../_components/Columns'

export default function Page({ params }: { params: { id: string } }) {
  const [prevProblemIds, setPrevProblemIds] = useState<number[]>([])
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showInvitationCode, setShowInvitationCode] = useState<boolean>(false)
  const { id } = params

  const router = useRouter()

  const methods = useForm<UpdateContestInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      isRankVisible: true,
      isVisible: true
    }
  })

  const { handleSubmit, getValues, setValue } = methods

  useQuery(GET_CONTEST, {
    variables: { contestId: Number(id) },
    onCompleted: (contestData) => {
      const storedContestFormData = localStorage.getItem(
        `contestFormData-${id}`
      )
      setValue('id', Number(id))
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
        setValue('invitationCode', contestFormData.invitationCode)
        if (contestFormData.invitationCode) {
          setShowInvitationCode(true)
        }
      } else {
        const data = contestData.getContest
        setValue('title', data.title)
        setValue('description', data.description)
        setValue('startTime', new Date(data.startTime))
        setValue('endTime', new Date(data.endTime))
        setValue('invitationCode', data.invitationCode)
        if (data.invitationCode) {
          setShowInvitationCode(true)
        }
      }
      setIsLoading(false)
    }
  })

  useQuery(GET_CONTEST_PROBLEMS, {
    variables: { groupId: 1, contestId: Number(id) },
    onCompleted: (problemData) => {
      const data = problemData.getContestProblems

      setPrevProblemIds(data.map((problem) => problem.problemId))
      const importedProblems = localStorage.getItem(`importProblems-${id}`)

      if (importedProblems === null) {
        const contestProblems = data.map((problem) => {
          return {
            id: problem.problemId,
            title: problem.problem.title,
            order: problem.order,
            difficulty: problem.problem.difficulty
          }
        })
        localStorage.setItem(
          'orderArray',
          JSON.stringify(data.map((problem) => problem.order))
        )
        localStorage.setItem(
          `importProblems-${id}`,
          JSON.stringify(contestProblems)
        )
        setProblems(contestProblems)
      } else {
        const parsedData = JSON.parse(importedProblems)
        if (parsedData.length > 0) {
          setProblems(parsedData)
          const orderArray = parsedData.map(
            // eslint-disable-next-line
            (_: any, index: number) => index
          )
          localStorage.setItem('orderArray', JSON.stringify(orderArray))
        }
      }
    }
  })

  const [updateContest, { error }] = useMutation(UPDATE_CONTEST)
  const [importProblemsToContest] = useMutation(IMPORT_PROBLEMS_TO_CONTEST)
  const [removeProblemsFromContest] = useMutation(REMOVE_PROBLEMS_FROM_CONTEST)
  const [updateVisible] = useMutation(UPDATE_PROBLEM_VISIBLE)
  const [updateContestProblemsOrder] = useMutation(
    UPDATE_CONTEST_PROBLEMS_ORDER
  )

  const onSubmit = async (input: UpdateContestInput) => {
    if (input.startTime >= input.endTime) {
      toast.error('Start time must be less than end time')
      return
    }

    const problemIds = problems.map((problem) => problem.id)

    const orderArray = JSON.parse(localStorage.getItem('orderArray') || '[]')
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

    await updateContest({
      variables: {
        groupId: 1,
        input
      }
    })
    if (error) {
      toast.error('Failed to update contest')
      return
    }

    await removeProblemsFromContest({
      variables: {
        groupId: 1,
        contestId: Number(id),
        problemIds: prevProblemIds
      }
    })
    await importProblemsToContest({
      variables: {
        groupId: 1,
        contestId: Number(id),
        problemIds
      }
    })
    const updateVisiblePromise = problemIds.map((id) =>
      updateVisible({
        variables: {
          groupId: 1,
          input: {
            id,
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
        contestId: Number(id),
        orders
      }
    })
    localStorage.removeItem('orderArray')
    localStorage.removeItem(`contestFormData-${id}`)
    localStorage.removeItem(`importProblems-${id}`)
    toast.success('Contest updated successfully')
    router.push('/admin/contest')
    router.refresh()
  }

  return (
    <ScrollArea className="w-full">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <Link href="/admin/contest">
            <FaAngleLeft className="h-12" />
          </Link>
          <span className="text-4xl font-bold">Edit Contest</span>
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
            <SwitchField
              name="invitationCode"
              title="Invitation Code"
              type="number"
              isInput={true}
              placeholder="Enter a invitation code"
              hasValue={showInvitationCode}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <ContestProblemListLabel />
                <ImportProblemButton
                  disabled={isLoading}
                  isCreatePage={false}
                  id={Number(id)}
                />
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
              className="flex h-[36px] w-[90px] items-center gap-2 px-0"
              disabled={isLoading}
            >
              <IoIosCheckmarkCircle fontSize={20} />
              <div className="text-base">Edit</div>
            </Button>
          </FormProvider>
        </form>
      </main>
    </ScrollArea>
  )
}
